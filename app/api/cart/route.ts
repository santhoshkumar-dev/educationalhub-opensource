import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Course from "@/models/course";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const user = await User.findOne({ clerk_id: userId }).populate({
      path: "cart.courseId",
      model: "Course",
      populate: [
        {
          path: "instructors",
          select: "first_name last_name profile_image_url",
        },
        {
          path: "organization",
          select: "name logo",
        },
      ],
    });

    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const cartItems = user.cart
      .filter((item: any) => item.courseId) // Filter out null/undefined courses
      .map((item: any) => ({
        _id: item.courseId._id,
        course_name: item.courseId.course_name,
        course_image: item.courseId.course_image,
        price: item.courseId.price || 0,
        discountedPrice: item.courseId.discountedPrice,
        slug: item.courseId.slug,
        instructors: item.courseId.instructors,
        organization: item.courseId.organization,
        addedAt: item.addedAt,
      }));

    return NextResponse.json({ items: cartItems });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
