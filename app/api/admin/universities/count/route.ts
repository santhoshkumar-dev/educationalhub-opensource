import { NextRequest, NextResponse } from "next/server";
import University from "@/models/university";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const totalUniversities = await University.countDocuments();

    return NextResponse.json(
      { universities: totalUniversities },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/universities/count error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
