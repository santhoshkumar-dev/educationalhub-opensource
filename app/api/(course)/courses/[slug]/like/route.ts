import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import CourseLike from "@/models/courseLike";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectMongoDB();

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { slug } = params;
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await CourseLike.findOne({
      user: user._id,
      course: course._id,
    });

    if (existingLike) {
      return NextResponse.json({ message: "Already liked" });
    }

    // Create like
    await CourseLike.create({
      user: user._id,
      course: course._id,
    });

    // Return updated like count
    const likeCount = await CourseLike.countDocuments({
      course: course._id,
    });

    return NextResponse.json({ message: "Like added", likes: likeCount });
  } catch (error) {
    console.error("Error adding like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectMongoDB();

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { slug } = params;
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if like exists
    const existingLike = await CourseLike.findOne({
      user: user._id,
      course: course._id,
    });

    if (!existingLike) {
      return NextResponse.json({ message: "Not liked" });
    }

    await existingLike.deleteOne();

    const likeCount = await CourseLike.countDocuments({
      course: course._id,
    });

    return NextResponse.json({ message: "Like removed", likes: likeCount });
  } catch (error) {
    console.error("Error removing like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
