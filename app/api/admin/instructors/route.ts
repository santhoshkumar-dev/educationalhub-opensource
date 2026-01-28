import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();

    // If search is empty or < 3 chars → return empty instructors array
    if (search.length < 3) {
      return NextResponse.json({ instructors: [] }, { status: 200 });
    }

    const query: any = { role: "instructor" };

    query.$or = [
      { first_name: { $regex: search, $options: "i" } },
      { last_name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];

    const instructors = await User.find(query)
      .select("first_name last_name _id")
      .limit(10);

    return NextResponse.json(
      { instructors: instructors || [] },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/instructors error:", error);
    return NextResponse.json(
      { instructors: [], error: "Something went wrong" },
      { status: 500 },
    );
  }
});
