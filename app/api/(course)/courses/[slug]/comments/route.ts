import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Comment from "@/models/comment";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import Course from "@/models/course";

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
    const { text, parentCommentId } = await req.json();

    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Comment text cannot be empty" },
        { status: 400 },
      );
    }

    // Optional: validate parent comment exists and belongs to this course
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (
        !parentComment ||
        parentComment.course.toString() !== course._id.toString()
      ) {
        return NextResponse.json(
          { error: "Invalid parent comment" },
          { status: 400 },
        );
      }
    }

    const newComment = new Comment({
      course: course._id,
      user: user._id,
      text: text.trim(),
      parentComment: parentComment ? parentComment._id : null,
    });

    await newComment.save();

    // Optionally populate user info for frontend convenience
    await newComment.populate("user", "name email");

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Error posting comment:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const comments = await Comment.find({ course: course._id })
      .populate("user", "first_name last_name profile_image_url email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
