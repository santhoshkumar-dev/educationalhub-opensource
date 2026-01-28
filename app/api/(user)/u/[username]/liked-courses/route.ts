import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import CourseLike from "@/models/courseLike";

export async function GET(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { username } = params;

    // 1️⃣ Find user
    const user = await User.findOne({ username }).select("_id");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2️⃣ Find liked courses and populate references
    const likedCourseLikes = await CourseLike.find({ user: user._id })
      .populate({
        path: "course",
        select:
          "_id course_name slug rating course_image htmlDescription description organization instructors tags",
        populate: [
          {
            path: "organization",
            select: "name logo _id",
          },
          {
            path: "instructors",
            select: "first_name last_name profile_image_url _id",
          },
        ],
      })
      .lean();

    // 3️⃣ Filter out any null courses
    const likedCourses = likedCourseLikes
      .map((like) => like.course)
      .filter((course) => course != null);

    // 4️⃣ Return
    return NextResponse.json({ likedCourses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching liked courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
