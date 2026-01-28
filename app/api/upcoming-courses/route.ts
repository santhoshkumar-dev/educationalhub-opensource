import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import UpcomingCourse from "@/models/upcomingCourse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();

    // Fetch from MongoDB, sorted by votes (desc) then createdAt (desc)
    const courses = await UpcomingCourse.find({ isAdded: false })
      .sort({ votes: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching upcoming courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming courses" },
      { status: 500 },
    );
  }
}
