export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import User from "@/models/userModel";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const instructor = await User.findOne({ clerk_id: userId });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const coursesData = await Course.find({ instructors: instructor._id })
      .populate("instructors", "first_name last_name email clerk_id profile_image_url");

    const courses = coursesData.map((c) => {
      const obj: any = c.toObject();
      obj.instructor =
        obj.instructors && obj.instructors.length > 0
          ? obj.instructors[0]
          : null;
      return obj;
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseData = await req.json();

    await connectMongoDB();
    const instructor = await User.findOne({ clerk_id: userId });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    // Ensure current instructor is included
    courseData.instructors = Array.from(
      new Set([instructor._id.toString(), ...(courseData.instructors || [])]),
    );

    // Compute totals
    if (courseData.courseType === "chapter") {
      courseData.total_chapters = courseData.chapters?.length || 0;
      courseData.total_videos = courseData.chapters?.reduce(
        (acc: number, ch: any) => acc + (ch.videos?.length || 0),
        0,
      );
    } else {
      courseData.total_chapters = 0;
      courseData.total_videos = courseData.videos?.length || 0;
    }

    const baseSlug = slugify(courseData.course_name || "");
    const existing = await Course.findOne({ slug: baseSlug });
    courseData.slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const course = new Course(courseData);
    await course.save();

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
