import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Course from "@/models/course";
import connectMongoDB from "@/lib/connectMongoDB";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const { clerk_id, courseSlug } = await req.json();
    const course = await Course.findOne({ slug: courseSlug });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const user = await User.findOne({ clerk_id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.completedCourses.includes(course._id)) {
      user.completedCourses.push(course._id);
    }

    await user.save();

    return NextResponse.json({ message: "Course marked as completed" });
  } catch (err) {
    console.error("Error in POST /api/courses/completeCourse", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
