import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Course from "@/models/course";

export async function POST(request: NextRequest) {
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

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find or create user
    let user = await User.findOne({ clerk_id: userId });
    if (!user) {
      user = new User({ clerk_id: userId, cart: [] });
    }

    // Check if course is already in cart
    const existingItem = user.cart.find(
      (item: any) => item.courseId.toString() === courseId,
    );
    if (existingItem) {
      return NextResponse.json(
        { error: "Course already in cart" },
        { status: 400 },
      );
    }

    // Check if user already has access to the course
    const hasAccess = user.courseProgress?.some(
      (progress: any) =>
        progress.courseSlug === course.slug && progress.hasAccess,
    );

    if (hasAccess) {
      return NextResponse.json(
        { error: "You already have access to this course" },
        { status: 400 },
      );
    }

    // Add to cart
    user.cart.push({
      courseId: courseId,
      addedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Course added to cart",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
