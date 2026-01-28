import { NextResponse, NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";

export async function POST(req: NextRequest) {
  try {
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id, firstName, lastName } = await req.json();

    // Connect to MongoDB
    await connectMongoDB();

    const user = new User({
      email: id,
      username: `${firstName} ${lastName}`,
    });
    await user.save();

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  console.log("API CALL");
  const { id } = await req.json();
  const userId = id;
  console.log(userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await clerkClient().users.deleteUser(userId);
    await connectMongoDB(); // Ensure the database is connected
    await User.deleteOne({ clerk_id: userId });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error deleting user" });
  }
}
