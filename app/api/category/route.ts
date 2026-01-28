import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import CourseCategories from "@/models/course-category";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    if (search.trim()) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } }, // Case-insensitive search
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const categories = await CourseCategories.find(query)
      .skip(skip)
      .limit(limit);
    const total = await CourseCategories.countDocuments(query);

    return NextResponse.json({
      data: categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
