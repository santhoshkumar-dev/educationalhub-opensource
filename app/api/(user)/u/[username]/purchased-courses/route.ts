import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Course from "@/models/course";

export async function GET(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { username } = params;

    // 1) Find User
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) Extract courseId array
    const courseIds = user.purchasedCourses?.map((c: any) => c.courseId) || [];

    if (courseIds.length === 0) {
      return NextResponse.json({ purchasedCourses: [] }, { status: 200 });
    }

    // 3) Fetch course data
    const purchasedCourses = await Course.find({ _id: { $in: courseIds } })
      .select(
        "_id course_name slug rating course_image htmlDescription description organization instructors tags",
      )
      .populate({
        path: "organization",
        select: "name logo _id",
      })
      .populate({
        path: "instructors",
        select: "first_name last_name profile_image_url _id",
      })
      .lean();

    // 4) Merge purchased metadata (purchasedAt, accessExpiryDate)
    const coursesWithPurchaseData = purchasedCourses.map((course: any) => {
      const purchaseInfo = user.purchasedCourses.find(
        (p: any) => p.courseId.toString() === course._id.toString(),
      );

      return {
        ...course,
        purchasedAt: purchaseInfo?.purchasedAt,
        accessExpiryDate: purchaseInfo?.accessExpiryDate,
        paymentId: purchaseInfo?.paymentId,
      };
    });

    return NextResponse.json(
      { purchasedCourses: coursesWithPurchaseData },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
