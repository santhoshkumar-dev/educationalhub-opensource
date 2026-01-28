import { NextRequest, NextResponse } from "next/server";
import Institution from "@/models/institution";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";
import { getOrSetCache } from "@/lib/redisHelper";
import { deleteCache } from "@/lib/redisHelper";
import "@/models/university";

// Helper to create a URL-friendly slug
const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

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
      bio,
      htmlBio,
      parentUniversity,
      socialLinks,
      type,
      location,
      mapUrl,
      slug,
    } = data;

    const newInstitution = await Institution.create({
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
      bio,
      htmlBio,
      parentUniversity,
      socialLinks,
      type,
      location,
      mapUrl,
    });

    await deleteCache(/institutions:page:.*/); // Clears all paginated cache
    // Invalidate cache for institutions

    return NextResponse.json(newInstitution, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/institutions error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
});

// WITHOUT CACHING

// export const GET = withAdmin(async (req: NextRequest) => {
//   try {
//     await connectMongoDB();

//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const limit = parseInt(searchParams.get("limit") || "10", 10);
//     const skip = (page - 1) * limit;

//     const institutions = await Institution.find()
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 })
//       .populate("parentUniversity");

//     const totalInstitutions = await Institution.countDocuments();
//     const totalPages = Math.ceil(totalInstitutions / limit);

//     return NextResponse.json(
//       { institutions, totalPages, currentPage: page },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("GET /api/admin/institutions error:", error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// });

// WITH CACHING

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sort = searchParams.get("sort") || "latest"; // default sort
    const skip = (page - 1) * limit;

    const sortOrder = sort === "oldest" ? 1 : -1; // oldest = ascending

    const cacheKey = `institutions:page:${page}:limit:${limit}:sort:${sort}`;

    const result = await getOrSetCache(cacheKey, async () => {
      const institutions = await Institution.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: sortOrder })
        .populate("parentUniversity");

      const total = await Institution.countDocuments();
      return {
        institutions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/institutions error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
});
