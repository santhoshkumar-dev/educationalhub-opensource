import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import CourseLike from "@/models/courseLike"; // add this!

// GET current user details
export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details from Clerk
    const user = await User.findOne({ clerk_id: userId })
      .populate("purchasedCourses")
      .populate("enrolledCourses")
      .populate("completedCourses");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch liked courses
    const likedCourseLikes = await CourseLike.find({ user: user._id }).populate(
      "course",
    );

    const likedCourses = likedCourseLikes
      .map((like) => like.course)
      .filter((course) => course != null); // Filter out nulls if any

    // Append likedCourses to user object
    const userWithLikedCourses = {
      ...user.toObject(),
      likedCourses,
    };

    // Return user with likedCourses
    return NextResponse.json({ user: userWithLikedCourses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
