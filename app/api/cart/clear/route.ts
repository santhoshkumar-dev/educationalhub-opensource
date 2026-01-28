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

    await connectMongoDB();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.cart = [];
    await user.save();

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
