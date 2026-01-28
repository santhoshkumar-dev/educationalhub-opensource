export const dynamic = "force-dynamic";

import connectMongoDB from "@/lib/connectMongoDB";
import Institution from "@/models/institution";
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();
    const count = await Institution.countDocuments({});
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
