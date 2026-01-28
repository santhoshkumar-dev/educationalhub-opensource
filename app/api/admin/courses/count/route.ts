export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/course";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const totalCourses = await Course.countDocuments();

    return NextResponse.json({ count: totalCourses }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/courses/count error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
