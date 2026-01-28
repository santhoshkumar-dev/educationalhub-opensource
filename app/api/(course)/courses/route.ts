export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import CourseLike from "@/models/courseLike";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    // --- Get query parameters ---
    const searchQuery = req.nextUrl.searchParams.get("search") || "";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const sort = req.nextUrl.searchParams.get("sort") || "popular";
    const tagsQuery = req.nextUrl.searchParams.get("tags");

    // --- Build Query Conditions ---
    const queryConditions: any[] = [];

    // Search Condition
    const searchRegex = searchQuery
      ? new RegExp(searchQuery.split("").join(".*"), "i")
      : null;

    if (searchRegex) {
      queryConditions.push({
        $or: [
          { course_name: { $regex: searchRegex } },
          { "instructor.first_name": { $regex: searchRegex } },
          { "instructor.last_name": { $regex: searchRegex } },
        ],
      });
    }

    // Tags Condition
    if (tagsQuery) {
      const tagsArray = tagsQuery.split(",");
      queryConditions.push({ tags: { $in: tagsArray } });
    }

    // ✅ Always include approved status
    let finalQuery: any = { status: "approved" };

    if (queryConditions.length > 0) {
      finalQuery = { $and: [{ status: "approved" }, ...queryConditions] };
    }

    // --- Handle "most-liked" sort separately with aggregation ---
    if (sort === "most-liked") {
      // Build match stage for aggregation
      const matchStage: any = finalQuery;

      const coursesData = await Course.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "courselikes", // MongoDB collection name (lowercase + plural)
            localField: "_id",
            foreignField: "course",
            as: "likesData",
          },
        },
        {
          $addFields: {
            likesCount: { $size: "$likesData" },
          },
        },
        { $sort: { likesCount: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "instructors",
            foreignField: "_id",
            as: "instructors",
          },
        },
        {
          $lookup: {
            from: "organizations",
            localField: "organization",
            foreignField: "_id",
            as: "organization",
          },
        },
        {
          $project: {
            course_name: 1,
            course_image: 1,
            slug: 1,
            total_videos: 1,
            tags: 1,
            isPaid: 1,
            description: 1,
            htmlDescription: 1,
            price: 1,
            discountedPrice: 1,
            likesCount: 1,
            instructors: {
              first_name: 1,
              last_name: 1,
              email: 1,
              clerk_id: 1,
              profile_image_url: 1,
            },
            organization: {
              name: 1,
              logo: 1,
              _id: 1,
            },
          },
        },
      ]);

      // Format response
      const courses = coursesData.map((c) => {
        const obj: any = c;
        obj.instructor = obj.instructors?.[0] || null;
        obj.organization = obj.organization?.[0] || null;
        delete obj.instructors;
        return obj;
      });

      const total = await Course.countDocuments(finalQuery);

      return NextResponse.json({
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        courses,
      });
    }

    // --- Sort logic for non-aggregated queries ---
    let sortOption: Record<string, 1 | -1> = { views: -1 };
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
      default:
        sortOption = { views: -1 };
        break;
    }

    // --- Query the database ---
    const coursesData = await Course.find(finalQuery)
      .skip(skip)
      .limit(limit)
      .select(
        "course_name course_image slug total_videos tags isPaid description htmlDescription instructors organization price discountedPrice",
      )
      .populate(
        "instructors",
        "first_name last_name email clerk_id profile_image_url",
      )
      .populate("organization", "name logo _id")
      .sort(sortOption);

    // --- Format response ---
    const courses = coursesData.map((c) => {
      const obj: any = c.toObject();
      obj.instructor = obj.instructors?.[0] || null;
      delete obj.instructors;
      return obj;
    });

    const total = await Course.countDocuments(finalQuery);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      courses,
    });
  } catch (err) {
    console.error("Error in GET /api/courses:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
