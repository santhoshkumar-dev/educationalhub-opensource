import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import UpcomingCourse from "@/models/upcomingCourse";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    await connectMongoDB();

    const course = await UpcomingCourse.findByIdAndUpdate(
      id,
      { $inc: { votes: 1 } },
      { new: true },
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ votes: course.votes });
  } catch (error) {
    console.error("Error voting for course:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
