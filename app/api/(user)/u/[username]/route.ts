import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";

export async function GET(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { username } = params;

    const user = await User.findOne({ username }).select(
      "username first_name last_name profile_image_url bio instagram facebook twitter website linkedin role",
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
