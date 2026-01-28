import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Institution from "@/models/institution";
import "@/models/university";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const institutions = await Institution.find(query)
      .limit(10)
      .sort({ name: 1 })
      .select("_id name");
    return NextResponse.json({ institutions }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/institutions error:", error);
    return NextResponse.json(
      { institutions: [], error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
