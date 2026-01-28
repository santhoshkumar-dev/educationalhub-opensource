// app/api/courses/getCourseProgress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCourseProgress } from "@/lib/courseProgress";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerk_id, courseSlug } = body;

    if (!clerk_id || !courseSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const progress = await getCourseProgress(clerk_id, courseSlug);

    return NextResponse.json({
      success: true,
      progress: progress || null,
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course progress",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
