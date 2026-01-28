/**
 * User Management API Routes
 *
 * This file contains operations for managing users in the admin dashboard.
 *
 * Features:
 * - GET: Retrieve users with pagination and sorting
 * - User statistics and analytics
 *
 * The API provides:
 * - Paginated user lists
 * - Sorting by creation date
 * - User enrollment and course information
 */

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Course from "@/models/course";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") === "oldest" ? 1 : -1;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select(
        "username first_name last_name email profile_image_url role created_at enrolledCourses purchasedCourses courseProgress onboardingComplete",
      )
      .populate("enrolledCourses", "course_name course_image slug")
      .populate("purchasedCourses.courseId", "course_name course_image slug")
      .sort({ created_at: sort })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data to include enrollment counts
    const usersWithStats = users.map((user: any) => {
      const enrolledCount = user.enrolledCourses?.length || 0;
      const purchasedCount = user.purchasedCourses?.length || 0;
      const progressCount = user.courseProgress?.length || 0;

      return {
        _id: user._id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_image_url: user.profile_image_url,
        role: user.role,
        created_at: user.created_at,
        onboardingComplete: user.onboardingComplete,
        stats: {
          enrolledCourses: enrolledCount,
          purchasedCourses: purchasedCount,
          coursesInProgress: progressCount,
        },
        enrolledCourses: user.enrolledCourses || [],
        purchasedCourses: user.purchasedCourses || [],
      };
    });

    return NextResponse.json({ users: usersWithStats }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
