import { NextResponse } from "next/server";
import User from "@/models/userModel";
import connectMongoDB from "@/lib/connectMongoDB";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    await connectMongoDB();

    const user = await User.findOne({
      clerk_id: id,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.log("Error in GET /api/user/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// update user profile

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataToUpdate = await request.json();

    await connectMongoDB();

    await clerkClient.users.updateUser(id, dataToUpdate);

    const user = await User.findOneAndUpdate(
      { clerk_id: id },
      dataToUpdate,
      { new: true }, // Return the updated document
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in PUT /api/user/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
