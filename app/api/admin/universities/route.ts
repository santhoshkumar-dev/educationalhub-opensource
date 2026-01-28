import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import University from "@/models/university";
import { withAdmin } from "@/lib/utils/withAdmin";

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();
    const data = await req.json();

    const {
      name,
      emailDomain,
      contactEmail,
      logo,
      address,
      city,
      state,
      country,
      pincode,
      phone,
      website,
      description,
      htmlDescription,
      socialLinks,
      type,
      location,
      mapUrl,
      slug,
    } = data;

    const newUniversity = await University.create({
      name,
      emailDomain,
      contactEmail,
      logo,
      address,
      city,
      state,
      country,
      pincode,
      phone,
      website,
      slug,
      description,
      htmlDescription,
      socialLinks,
      type,
      location,
      mapUrl,
    });

    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error: any) {
    console.error("POST university error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    // Build query with optional search
    const query = search
      ? { name: { $regex: search, $options: "i" } } // Case-insensitive partial match
      : {};

    const universities = await University.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUniversities = await University.countDocuments(query);
    const totalPages = Math.ceil(totalUniversities / limit);

    return NextResponse.json(
      { universities, totalPages, currentPage: page },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("GET /api/admin/universities error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
});
