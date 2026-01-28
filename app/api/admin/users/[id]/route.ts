/**
 * User Details API Route
 *
 * Provides detailed information about a specific user including:
 * - User profile information
 * - Enrolled courses
 * - Purchased courses
 * - Course progress
 * - Activity statistics
 */

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Course from "@/models/course";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin<{ params: { id: string } }>(
  async (req: NextRequest, { params }) => {
    try {
      await connectMongoDB();

      const user = await User.findById(params.id)
        .populate("enrolledCourses", "course_name course_image slug price")
        .populate(
          "purchasedCourses.courseId",
          "course_name course_image slug price",
        )
        .populate("completedCourses", "course_name course_image slug")
        .populate("courseProgress.course", "course_name course_image slug")
        .populate("institution", "name")
        .populate("organization", "name")
        .lean();

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Type assertion for user object
      const userData = user as any;

      // Calculate statistics
      const enrolledCount = Array.isArray(userData.enrolledCourses)
        ? userData.enrolledCourses.length
        : 0;
      const purchasedCount = Array.isArray(userData.purchasedCourses)
        ? userData.purchasedCourses.length
        : 0;
      const completedCount = Array.isArray(userData.completedCourses)
        ? userData.completedCourses.length
        : 0;
      const progressCount = Array.isArray(userData.courseProgress)
        ? userData.courseProgress.length
        : 0;

      // Calculate total videos watched
      let totalVideosWatched = 0;
      if (Array.isArray(userData.courseProgress)) {
        userData.courseProgress.forEach((progress: any) => {
          totalVideosWatched += progress.watchedVideos?.length || 0;
        });
      }

      // Calculate total watch time (in seconds)
      let totalWatchTime = 0;
      if (Array.isArray(userData.courseProgress)) {
        userData.courseProgress.forEach((progress: any) => {
          if (progress.watchedVideos) {
            progress.watchedVideos.forEach((video: any) => {
              totalWatchTime += video.currentTime || 0;
            });
          }
        });
      }

      // Format watch time
      const hours = Math.floor(totalWatchTime / 3600);
      const minutes = Math.floor((totalWatchTime % 3600) / 60);
      const formattedWatchTime = `${hours}h ${minutes}m`;

      return NextResponse.json(
        {
          user: {
            ...userData,
            stats: {
              enrolledCourses: enrolledCount,
              purchasedCourses: purchasedCount,
              completedCourses: completedCount,
              coursesInProgress: progressCount,
              totalVideosWatched,
              totalWatchTime: formattedWatchTime,
            },
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("GET /api/admin/users/[id] error:", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }
  },
);
