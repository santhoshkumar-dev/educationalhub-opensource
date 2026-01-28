import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import User from "@/models/userModel";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const instructor = await User.findOne({ clerk_id: userId });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const course = await Course.findOne({
      _id: id,
      instructors: instructor._id,
    }).populate(
      "instructors",
      "first_name last_name email clerk_id profile_image_url",
    );

    if (!course) {
      return NextResponse.json(
        { error: "No courses found for this user." },
        { status: 404 },
      );
    }

    const obj: any = course.toObject();
    obj.instructor =
      obj.instructors && obj.instructors.length > 0 ? obj.instructors[0] : null;

    return NextResponse.json(obj, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const courseData = await req.json();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const instructor = await User.findOne({ clerk_id: userId });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const existingCourse = await Course.findOne({
      _id: id,
      instructors: instructor._id,
    });
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found or you're not the instructor." },
        { status: 404 },
      );
    }

    // Ensure current instructor is included
    courseData.instructors = Array.from(
      new Set([
        ...((courseData.instructors as string[] | undefined) || existingCourse.instructors.map((i:any) => i.toString())),
        instructor._id.toString(),
      ]),
    );

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: id, instructors: instructor._id },
      courseData,
      { new: true },
    ).populate(
      "instructors",
      "first_name last_name email clerk_id profile_image_url",
    );

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (err) {
    console.error("Error in PATCH /api/course:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
