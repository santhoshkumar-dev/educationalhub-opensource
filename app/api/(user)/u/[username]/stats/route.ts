import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Follow from "@/models/follow";
import Course from "@/models/course";

export async function GET(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { username } = params;

    const user = await User.findOne({ username }).select("_id");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Perform counts in parallel for better performance
    const [followerCount, publishedCourseCount] = await Promise.all([
      Follow.countDocuments({ followed: user._id }), // Assuming 'followed' is the field for the user being followed
      Course.countDocuments({ instructors: user._id, published: true }),
    ]);

    return NextResponse.json(
      {
        stats: {
          followers: followerCount,
          publishedCourses: publishedCourseCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
