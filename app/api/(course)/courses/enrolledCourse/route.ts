import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Course from "@/models/course";
import connectMongoDB from "@/lib/connectMongoDB";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const { clerk_id, courseSlug } = await req.json();

    // Find course
    const course = await Course.findOne({ slug: courseSlug })
      .select("_id")
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find user
    const user = await User.findOne({ clerk_id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already enrolled
    const courseId = Array.isArray(course) ? course[0]?._id : course._id;
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
    } else {
      // If already enrolled, no need to push again
      return NextResponse.json({ message: "Already enrolled" });
    }

    await user.save();

    return NextResponse.json({ message: "Course marked as enrolled" });
  } catch (err) {
    console.error("Error in POST /api/courses/enrollCourse", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
