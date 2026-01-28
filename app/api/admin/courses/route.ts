/**
 * Course Management API Routes
 *
 * This file contains CRUD operations for managing courses with comprehensive validation.
 *
 * Features:
 * - POST: Create new courses with full validation
 * - GET: Retrieve courses with pagination and sorting
 * - PUT: Update existing courses with validation
 * - DELETE: Remove courses
 *
 * Validation includes:
 * - Required fields validation (course_name, course_image, htmlDescription, description)
 * - Course type validation (chapter vs video)
 * - Video/Chapter structure validation
 * - ObjectId format validation for references
 * - Numeric field range validation (price, rating, etc.)
 *
 * The API automatically:
 * - Generates unique slugs based on course names
 * - Computes total chapters and videos
 * - Handles both chapter-based and video-based courses
 * - Replaces video references with actual video documents
 */

import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/course";
import Video from "@/models/videoModel";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";
import {
  BaseCourseData,
  Chapter,
  VideoRef,
  VideoDoc,
  CourseType,
} from "@/types/course";
import { validateCourseData } from "@/lib/utils/courseValidation";

const COMMON_SUFFIXES = ["learn", "online", "academy", "course"] as const;

// ---------- Utils ----------
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

/** Handles both Windows "\" and POSIX "/" and ignores empty segments. */
const splitPath = (p: string) => p.split(/[/\\]+/).filter(Boolean);

/**
 * The original code picked the *parent directory* of the file (parts[len-2]) as the ID.
 * Keeping that behavior, but defensively guarding short paths.
 */
const extractVideoIdFromRef = (videoSrc: string): string | null => {
  const parts = splitPath(videoSrc);
  return parts.length >= 2 ? parts[parts.length - 2] : null;
};

const randomString = (length = 4) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++)
    out += chars[(Math.random() * chars.length) | 0];
  return out;
};

const candidatesForSlug = (base: string) => {
  // attempts 0..n try common suffixes, then fall back to random
  return function* (): Generator<string> {
    for (const s of COMMON_SUFFIXES) yield `${base}-${s}`;
    while (true) yield `${base}-${randomString(4)}`;
  };
};

const generateUniqueSlug = async (
  baseSlug: string,
  courseIdToExclude: string | null = null,
) => {
  let slug = baseSlug;

  // First, check if base slug is free:
  const baseExists = await Course.findOne({
    slug,
    ...(courseIdToExclude ? { _id: { $ne: courseIdToExclude } } : {}),
  }).lean();

  if (!baseExists) return slug;

  // Then iterate through candidates:
  const gen = candidatesForSlug(baseSlug)();
  // Avoid infinite loop in bizarre collisions by capping (very generous):
  for (let i = 0; i < 10_000; i++) {
    const candidate = gen.next().value as string;
    const exists = await Course.findOne({
      slug: candidate,
      ...(courseIdToExclude ? { _id: { $ne: courseIdToExclude } } : {}),
    }).lean();
    if (!exists) return candidate;
  }

  throw new Error("Unable to generate a unique slug");
};

const extractAllVideoIds = (data: BaseCourseData): string[] => {
  const ids = new Set<string>();

  if (data.courseType === "chapter" && data.chapters) {
    for (const ch of data.chapters) {
      for (const v of ch.videos ?? []) {
        const id = "video_src" in v ? extractVideoIdFromRef(v.video_src) : v.id;
        if (id) ids.add(id);
      }
    }
  } else if (data.courseType === "video" && data.videos) {
    for (const v of data.videos) {
      const id = "video_src" in v ? extractVideoIdFromRef(v.video_src) : v.id;
      if (id) ids.add(id);
    }
  }

  return Array.from(ids);
};

const fetchVideosMap = async (ids: string[]) => {
  if (!ids.length) return new Map<string, VideoDoc>();
  const docs = await Video.find(
    { id: { $in: ids } },
    { _id: 0, id: 1, videoPath: 1, title: 1, video_length: 1, preview: 1 },
  ).lean<VideoDoc[]>();
  const map = new Map<string, VideoDoc>();
  for (const d of docs) map.set(d.id, d);
  return map;
};

const replaceRefsWithDocs = (
  data: BaseCourseData,
  videoMap: Map<string, VideoDoc>,
) => {
  const toDocOrKeep = (v: VideoRef | VideoDoc): VideoRef | VideoDoc => {
    if ("video_src" in v) {
      const id = extractVideoIdFromRef(v.video_src);
      return id && videoMap.has(id) ? (videoMap.get(id)! as VideoDoc) : v;
    }
    return v;
  };

  if (data.courseType === "chapter" && data.chapters) {
    data.chapters = data.chapters.map((ch) => ({
      ...ch,
      videos: (ch.videos ?? []).map(toDocOrKeep),
    }));
  } else if (data.courseType === "video" && data.videos) {
    data.videos = data.videos.map(toDocOrKeep);
  }
};

const computeTotals = (data: BaseCourseData) => {
  if (data.courseType === "chapter") {
    const chapters = data.chapters ?? [];
    data.total_chapters = chapters.length;
    data.total_videos = chapters.reduce(
      (acc, ch) => acc + (ch.videos?.length ?? 0),
      0,
    );
  } else {
    data.total_chapters = 0;
    data.total_videos = (data.videos ?? []).length;
  }
};

const resolveBaseSlug = (data: BaseCourseData) => {
  const base = data.course_name || "";
  const baseSlug = slugify(base);
  if (!baseSlug) {
    throw new Error("course_name is required to generate slug");
  }
  return baseSlug;
};

// ---------- Route ----------
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const courseData = (await req.json()) as BaseCourseData;

    // 1) Validate the course data
    const validationErrors = validateCourseData(courseData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // 2) Collect all unique video IDs from the payload
    const videoIds = extractAllVideoIds(courseData);

    // 3) Fetch their documents in one query and map them
    const videoMap = await fetchVideosMap(videoIds);

    // 4) Replace refs in payload with actual docs where possible
    replaceRefsWithDocs(courseData, videoMap);

    // 5) Compute totals
    computeTotals(courseData);

    // 6) Slug
    const uniqueSlug = await generateUniqueSlug(resolveBaseSlug(courseData));
    courseData.slug = uniqueSlug;

    // 7) Persist
    const course = new Course(courseData);
    await course.save();

    return NextResponse.json({
      message: "Course published successfully",
      slug: courseData.slug,
    });
  } catch (err: any) {
    console.error("Error in POST /api/course:", err?.message ?? err);
    const msg =
      err?.message === "Unable to generate a unique slug" ||
      err?.message?.includes("required to generate slug")
        ? err.message
        : "Internal Server Error";

    return NextResponse.json(
      { error: msg },
      { status: msg === "Internal Server Error" ? 500 : 400 },
    );
  }
});

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") === "oldest" ? 1 : -1;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/courses error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});

export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    const courseData = (await req.json()) as Partial<BaseCourseData>;

    // Validate only provided fields
    if (Object.keys(courseData).length > 0) {
      const validationErrors = validateCourseData(courseData as BaseCourseData);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationErrors,
          },
          { status: 400 },
        );
      }
    }

    await connectMongoDB();

    // Check if course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If course_name is being updated, generate new slug
    if (
      courseData.course_name &&
      courseData.course_name !== existingCourse.course_name
    ) {
      const baseSlug = slugify(courseData.course_name);
      courseData.slug = await generateUniqueSlug(baseSlug, courseId);
    }

    // Collect video IDs and replace refs if needed
    if (courseData.chapters || courseData.videos) {
      const videoIds = extractAllVideoIds(courseData as BaseCourseData);
      const videoMap = await fetchVideosMap(videoIds);
      replaceRefsWithDocs(courseData as BaseCourseData, videoMap);
      computeTotals(courseData as BaseCourseData);
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(courseId, courseData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/courses:", err?.message ?? err);

    if (err.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: Object.values(err.errors).map((e: any) => e.message),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});

export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // Check if course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/courses:", err?.message ?? err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
