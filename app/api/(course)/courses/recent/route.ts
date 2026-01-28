import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const courses = await Course.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("organization", "name logo _id")
      .select(
        "id course_name slug rating course_image htmlDescription description organization tags createdAt",
      )
      .lean();

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch recently added courses." },
      { status: 500 },
    );
  }
}
