import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/connectMongoDB";
import RecommendationEngine from "@/lib/recommendationEngine";
import User from "@/models/userModel";
import Course from "@/models/course";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get user from database
    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const refresh = searchParams.get("refresh") === "true";

    console.log("Fetching recommendations:", { userId, limit, refresh });

    // Get recommendations from engine - pass Clerk userId
    const recommendations = await RecommendationEngine.getRecommendations(
      user._id.toString(),
      limit,
      refresh,
    );

    console.log(`Got ${recommendations.length} recommendations from engine`);

    // Check if courses are already populated
    if (recommendations.length > 0) {
      console.log("Courses not populated, fetching from database...");

      // Extract courseIds
      const courseIds = recommendations.map((rec) => rec.courseId);

      // Fetch all courses in one query with populated fields
      const courses = await Course.find({
        _id: { $in: courseIds },
      })
        .populate("organization", "name logo _id")
        .populate(
          "instructors",
          "first_name last_name email clerk_id profile_image_url",
        )
        .lean();

      console.log(
        `Found ${courses.length} courses out of ${courseIds.length} course IDs`,
      );

      // Create a map for quick lookup
      const courseMap = new Map(
        courses.map((course: any) => [course._id.toString(), course]),
      );

      // Attach course data to recommendations
      const populatedRecommendations = recommendations
        .map((rec) => {
          const course = courseMap.get(rec.courseId.toString());

          if (!course) {
            console.warn(`Course not found for ID: ${rec.courseId}`);
            return null;
          }

          return {
            courseId: rec.courseId,
            score: rec.score,
            reason: rec.reason,
            sources: rec.sources,
            course: {
              _id: course._id,
              course_name: course.course_name,
              course_image: course.course_image,
              slug: course.slug,
              rating: course.rating,
              htmlDescription: course.htmlDescription,
              description: course.description,
              tags: course.tags,
              price: course.price,
              discountedPrice: course.discountedPrice,
              discount: course.discount,
              isPaid: course.isPaid,
              organization: course.organization,
              instructors: course.instructors,
              categories: course.categories,
              views: course.views,
              status: course.status,
            },
          };
        })
        .filter((rec) => rec !== null); // Remove null entries (courses not found)

      console.log(
        `Returning ${populatedRecommendations.length} populated recommendations`,
      );

      return NextResponse.json({
        success: true,
        recommendations: populatedRecommendations,
        meta: {
          total: populatedRecommendations.length,
          limit,
          refresh,
        },
      });
    }

    // If recommendations already have course data
    console.log(
      `Returning ${recommendations.length} recommendations (already populated)`,
    );

    return NextResponse.json({
      success: true,
      recommendations,
      meta: {
        total: recommendations.length,
        limit,
        refresh,
      },
    });
  } catch (error: any) {
    console.error("Recommendations API error:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recommendations",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
