import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import CourseLike from "@/models/courseLike";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectMongoDB();

    const { slug } = params;
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Always return the like count
    const likeCount = await CourseLike.countDocuments({ course: course._id });

    // If not authenticated, expose count but mark as not liked
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({
        liked: false,
        likes: likeCount,
      });
    }

    // If authenticated, check actual like status
    const user = await User.findOne({ clerk_id: userId });
    // If the user record isn't found, still return the count (not an error)
    if (!user) {
      return NextResponse.json({
        liked: false,
        likes: likeCount,
      });
    }

    const existingLike = await CourseLike.findOne({
      user: user._id,
      course: course._id,
    });

    return NextResponse.json({
      liked: !!existingLike,
      likes: likeCount,
    });
  } catch (error) {
    console.error("Error fetching like status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
