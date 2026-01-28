/**
 * User Statistics API Route
 *
 * Provides aggregated statistics about users for the admin dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Session from "@/models/sessionModel";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get currently active users (users with active sessions in the last 30 minutes)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const activeSessions = await Session.find({
      status: "active",
      lastActiveAt: { $gte: thirtyMinutesAgo },
    }).distinct("userId");

    const currentlyActiveUsers = activeSessions.length;

    // Get engaged users (users who have enrolled in at least one course, purchased, or have progress)
    const engagedUsers = await User.countDocuments({
      $or: [
        { enrolledCourses: { $exists: true, $ne: [] } },
        { purchasedCourses: { $exists: true, $ne: [] } },
        { courseProgress: { $exists: true, $ne: [] } },
      ],
    });

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize roleStats with default values
    const roleStats: {
      admin: number;
      user: number;
      instructor: number;
      student: number;
    } = { admin: 0, user: 0, instructor: 0, student: 0 };

    // Populate roleStats from aggregation results
    usersByRole.forEach((item: any) => {
      const role = item._id || "user";
      if (role in roleStats) {
        roleStats[role as keyof typeof roleStats] = item.count;
      }
    });

    // Get users who completed onboarding
    const onboardingComplete = await User.countDocuments({
      onboardingComplete: true,
    });

    // Get users with enrolled courses
    const usersWithEnrollments = await User.countDocuments({
      enrolledCourses: { $exists: true, $ne: [] },
    });

    // Get users with purchased courses
    const usersWithPurchases = await User.countDocuments({
      purchasedCourses: { $exists: true, $ne: [] },
    });

    // Get recently registered users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      created_at: { $gte: thirtyDaysAgo },
    });

    return NextResponse.json(
      {
        totalUsers,
        currentlyActiveUsers, // Users currently signed in (active sessions in last 30 min)
        engagedUsers, // Users with enrollments, purchases, or progress
        inactiveUsers: totalUsers - engagedUsers,
        roleStats,
        onboardingComplete,
        onboardingIncomplete: totalUsers - onboardingComplete,
        usersWithEnrollments,
        usersWithPurchases,
        recentUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/users/stats error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
