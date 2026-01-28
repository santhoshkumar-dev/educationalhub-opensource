import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import Video from "@/models/videoModel";

// Helpers
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

const COMMON_SUFFIXES = ["learn", "online", "academy", "course"];

const randomString = (length = 4) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

const generateUniqueSlug = async (
  baseSlug: string,
  courseIdToExclude = null,
) => {
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existingCourse = await Course.findOne({
      slug,
      ...(courseIdToExclude ? { _id: { $ne: courseIdToExclude } } : {}),
    });

    if (!existingCourse) break; // slug is unique

    // Append extra word or random suffix
    if (attempt < COMMON_SUFFIXES.length) {
      slug = `${baseSlug}-${COMMON_SUFFIXES[attempt]}`;
    } else {
      slug = `${baseSlug}-${randomString(4)}`;
    }

    attempt++;
  }

  return slug;
};

// Main POST handler
export async function POST(req: NextRequest) {
  try {
    const courseData = await req.json();
    await connectMongoDB();

    const videoIds = [] as string[];

    if (courseData.courseType === "chapter") {
      for (const chapter of courseData.chapters) {
        for (const video of chapter.videos) {
          const parts = video.video_src.split("\\");
          const video_src = parts[parts.length - 2];
          videoIds.push(video_src);
        }
      }
    } else if (courseData.courseType === "video") {
      for (const video of courseData.videos) {
        const parts = video.video_src.split("\\");
        const video_src = parts[parts.length - 2];
        videoIds.push(video_src);
      }
    }

    // Lookup video details by IDs
    const videos = await Video.aggregate([
      { $match: { id: { $in: videoIds } } },
      {
        $project: {
          _id: 0,
          id: 1,
          videoPath: 1,
        },
      },
    ]);

    // Create a map of video ID to video details
    const videoMap = videos.reduce((acc, video) => {
      acc[video.id] = video;
      return acc;
    }, {});

    // Update courseData with video details
    if (courseData.courseType === "chapter") {
      for (const chapter of courseData.chapters) {
        chapter.videos = chapter.videos.map(
          (video: { video_src: string | number }) =>
            videoMap[video.video_src] || video,
        );
      }
    } else if (courseData.courseType === "video") {
      courseData.videos = courseData.videos.map(
        (video: { video_src: string | number }) =>
          videoMap[video.video_src] || video,
      );
    }

    // Calculate totals if not provided
    if (courseData.courseType === "chapter") {
      courseData.total_chapters = courseData.chapters.length;
      courseData.total_videos = courseData.chapters.reduce(
        (acc: number, ch: any) => acc + ch.videos.length,
        0,
      );
    } else {
      courseData.total_chapters = 0;
      courseData.total_videos = courseData.videos.length;
    }

    // Generate slug
    const baseSlug = courseData.course_name
      ? slugify(courseData.course_name)
      : slugify(courseData.store_name);

    if (!baseSlug) {
      throw new Error("store_name or slug is required to generate slug");
    }

    const uniqueSlug = await generateUniqueSlug(baseSlug);
    courseData.slug = uniqueSlug;

    // Save course
    const course = new Course(courseData);
    await course.save();

    return NextResponse.json({
      message: "Course published successfully",
      slug: courseData.slug,
    });
  } catch (err) {
    console.error("Error in POST /api/course:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
