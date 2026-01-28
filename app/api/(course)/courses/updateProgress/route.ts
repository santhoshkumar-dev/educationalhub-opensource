// app/api/courses/updateProgress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateVideoProgress } from "@/lib/courseProgress";
import { IUpdateProgressRequest } from "@/types/courseProgress";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Course from "@/models/course";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body: IUpdateProgressRequest = await request.json();
    const {
      clerk_id,
      courseSlug,
      chapterIndex,
      videoIndex,
      currentTime,
      duration,
      completed,
    } = body;

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await Course.findOne({ slug: courseSlug });
    const user = await User.findOne({ clerk_id: clerk_id });

    if (
      !clerk_id ||
      !courseSlug ||
      chapterIndex === undefined ||
      videoIndex === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const updates: {
      currentTime?: number;
      duration?: number;
      completed?: boolean;
    } = {};

    if (currentTime !== undefined) updates.currentTime = currentTime;
    if (duration !== undefined) updates.duration = duration;
    if (completed !== undefined) updates.completed = completed;

    const progress = await updateVideoProgress(
      clerk_id,
      courseSlug,
      chapterIndex,
      videoIndex,
      updates,
      course._id,
      user._id,
    );

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}
