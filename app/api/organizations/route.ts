import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Organization from "@/models/organization";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const organizations = await Organization.find(query)
      .limit(10)
      .sort({ name: 1 })
      .select("_id name");
    return NextResponse.json({ organizations }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/organizations error:", error);
    return NextResponse.json(
      { organizations: [], error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
