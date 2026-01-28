import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove from cart
    user.cart = user.cart.filter(
      (item: any) => item.courseId.toString() !== courseId,
    );
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Course removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
