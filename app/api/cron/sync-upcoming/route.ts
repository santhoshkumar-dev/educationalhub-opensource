import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import UpcomingCourse from "@/models/upcomingCourse";

export const dynamic = "force-dynamic";

export async function GET() {
  const FORM_ID = process.env.TALLY_FORM_ID;
  const API_KEY = process.env.TALLY_API_KEY;

  if (!FORM_ID || !API_KEY) {
    return NextResponse.json(
      { error: "Missing TALLY_FORM_ID or TALLY_API_KEY" },
      { status: 500 },
    );
  }

  try {
    await connectMongoDB();

    const res = await fetch(
      `https://api.tally.so/forms/${FORM_ID}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`Tally API error: ${res.statusText}`);
    }

    const data = await res.json();
    const submissions = data.submissions || [];
    let addedCount = 0;
    let updatedCount = 0;

    for (const sub of submissions) {
      const responses = sub.responses || [];

      const getAnswer = (questionId: string) => {
        const response = responses.find(
          (r: any) => r.questionId === questionId,
        );
        if (!response) return null;

        if (Array.isArray(response.answer)) {
          return response.answer.join(", ");
        }
        return response.answer;
      };

      const courseName = getAnswer("ad8jW9") || "Untitled Course";
      // "6NX1X5" is input link, "7x8J8z" is resource link (if present)
      const courseUrl = getAnswer("6NX1X5") || getAnswer("7x8J8z") || "";
      const platform = getAnswer("7x8JQL") || "";

      // Upsert logic: Update if exists, Insert if new
      const result = await UpcomingCourse.updateOne(
        { tallyId: sub.id },
        {
          $set: {
            courseName: courseName,
            courseUrl: courseUrl,
            platform: platform,
          },
          $setOnInsert: {
            votes: 0,
            tallyId: sub.id,
            // we keep createdAt from Tally as valid creation time if we wanted,
            // but mongoose timestamps handling is cleaner for our DB record
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) addedCount++;
      if (result.modifiedCount > 0) updatedCount++;
    }

    return NextResponse.json({
      message: "Sync completed",
      stats: {
        total: submissions.length,
        added: addedCount,
        updated: updatedCount,
      },
    });
  } catch (error) {
    console.error("Error syncing upcoming courses:", error);
    return NextResponse.json(
      { error: "Failed to sync upcoming courses" },
      { status: 500 },
    );
  }
}
