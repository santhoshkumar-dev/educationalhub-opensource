import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/connectMongoDB";
import RecommendationEngine from "@/lib/recommendationEngine";
import User from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { courseId, actionType } = await request.json();

    if (!courseId || !actionType) {
      return NextResponse.json(
        { error: "courseId and actionType are required" },
        { status: 400 },
      );
    }

    await RecommendationEngine.logActivity(user._id, courseId, actionType);

    return NextResponse.json({
      success: true,
      message: "Activity logged successfully",
    });
  } catch (error) {
    console.error("Activity logging error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 },
    );
  }
}
