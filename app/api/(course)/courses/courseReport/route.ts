import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import CourseReport from "@/models/courseReport";
import connectMongoDB from "@/lib/connectMongoDB";
import { auth } from "@clerk/nextjs/server";
import Course from "@/models/course";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerk_id: userId });

    const { courseId, reportType, description } = await req.json();

    const course = await Course.findById(courseId);

    // Validate input
    if (!courseId || !reportType || !description) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    // Create a new course report
    const newReport = new CourseReport({
      user: user._id,
      course: course._id,
      reportType,
      description,
    });

    await newReport.save();

    return NextResponse.json(
      { message: "Report submitted successfully." },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error submitting course report:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
}
