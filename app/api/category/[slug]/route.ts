import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import CourseCategory from "@/models/course-category";
import Course from "@/models/course";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    await connectMongoDB();

    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const sort = searchParams.get("sort") || "popular";
    const tagsQuery = searchParams.get("tags");
    const skip = (page - 1) * limit;

    // Find category by slug
    const category = await CourseCategory.findOne({ slug });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Build query conditions
    const queryConditions: any[] = [
      { categories: category._id, status: "approved" },
    ];

    // Add tags filter if provided
    if (tagsQuery) {
      const tagsArray = tagsQuery.split(",");
      queryConditions.push({ tags: { $in: tagsArray } });
    }

    // Combine conditions
    const finalQuery =
      queryConditions.length > 1
        ? { $and: queryConditions }
        : queryConditions[0];

    // Build sort criteria
    let sortCriteria: any = { views: -1 };
    if (sort === "newest") {
      sortCriteria = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortCriteria = { createdAt: 1 };
    }

    // Find courses
    const coursesData = await Course.find(finalQuery)
      .populate(
        "instructors",
        "first_name last_name email profile_image_url clerk_id",
      )
      .populate("organization", "name logo _id")
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria);

    // Process courses to match expected format
    const courses = coursesData.map((c) => {
      const obj: any = c.toObject();
      obj.instructor = obj.instructors?.[0] || null;
      delete obj.instructors;
      return obj;
    });

    const totalCourses = await Course.countDocuments(finalQuery);

    return NextResponse.json({
      category: {
        _id: category._id,
        img: category.img,
        title: category.title,
        slug: category.slug,
        description: category.description,
      },
      courses,
      total: totalCourses,
      page,
      totalPages: Math.ceil(totalCourses / limit),
    });
  } catch (error) {
    console.error("Error fetching category courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
