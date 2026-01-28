import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Follow from "@/models/follow";

export async function POST(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const follower = await User.findOne({ clerk_id: userId });

    if (!follower) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await User.findOne({ username: params.username });
    if (!user) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    if (follower._id.equals(user._id)) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 },
      );
    }

    const existing = await Follow.findOne({
      user: user._id,
      follower: follower._id,
    });
    if (existing) {
      return NextResponse.json({ message: "Already followed" });
    }

    await Follow.create({ user: user._id, follower: follower._id });
    const followers = await Follow.countDocuments({ user: user._id });
    return NextResponse.json({ message: "Followed", followers });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const follower = await User.findOne({ clerk_id: userId });
    if (!follower) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await User.findOne({ username: params.username });
    if (!user) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    const existing = await Follow.findOne({
      user: user._id,
      follower: follower._id,
    });
    if (!existing) {
      return NextResponse.json({ message: "Not followed" });
    }

    await existing.deleteOne();
    const followers = await Follow.countDocuments({ user: user._id });
    return NextResponse.json({ message: "Unfollowed", followers });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
