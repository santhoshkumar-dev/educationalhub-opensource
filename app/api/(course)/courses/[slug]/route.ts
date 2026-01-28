import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import Payment from "@/models/payment";
import User from "@/models/userModel";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params;
    const { userId } = auth();

    await connectMongoDB();

    const user = userId ? await User.findOne({ clerk_id: userId }) : null;

    await Course.updateOne({ slug }, { $inc: { views: 1 } });

    const data = await Course.findOne({ slug })
      .populate(
        "instructors",
        "first_name last_name email clerk_id profile_image_url",
      )
      .populate("organization", "name slug logo _id");

    if (!data) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = data.toObject();
    let hasAccess = false;

    // --- Check access logic ---
    if (course.isPaid) {
      if (user) {
        // 1️⃣ Check if course exists in user's purchasedCourses
        const alreadyPurchased = user.purchasedCourses.some(
          (item: any) => item.courseId?.toString() === course._id.toString(),
        );

        if (alreadyPurchased) {
          hasAccess = true;
        } else {
          // 2️⃣ Fallback: Check if any successful payment includes this course
          const payment = await Payment.findOne({
            userId: user._id,
            paymentStatus: "success",
            $or: [
              { courseId: course._id }, // single course
              { "cartItems.courseId": course._id }, // from cart checkout
            ],
          });

          if (payment) hasAccess = true;
        }
      }

      // Add flag for frontend
      course.hasAccess = hasAccess;

      // Restrict videos if user has no access
      if (!hasAccess) {
        if (course.chapters && course.chapters.length > 0) {
          course.chapters = course.chapters.map((chapter: any) => ({
            ...chapter,
            videos: chapter.videos.map((video: any) => ({
              ...video,
              video_src: video.preview ? video.video_src : null,
            })),
          }));
        }

        if (course.videos && course.videos.length > 0) {
          course.videos = course.videos.map((video: any) => ({
            ...video,
            video_src: video.preview ? video.video_src : null,
          }));
        }
      }
    } else {
      // Free course — everyone can access
      course.hasAccess = true;
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
