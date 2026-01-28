// app/api/courses/getProgress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVideoProgress } from "@/lib/courseProgress";
import { IGetProgressRequest } from "@/types/courseProgress";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: IGetProgressRequest = await request.json();
    const { clerk_id, courseSlug, chapterIndex, videoIndex } = body;

    // Validate required fields
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

    // Optional: Verify user is requesting their own progress
    if (userId !== clerk_id) {
      return NextResponse.json(
        { error: "Forbidden - Cannot access other user's progress" },
        { status: 403 },
      );
    }

    const progress = await getVideoProgress(
      clerk_id,
      courseSlug,
      chapterIndex,
      videoIndex,
    );

    return NextResponse.json({
      success: true,
      progress: progress || null,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch progress",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
