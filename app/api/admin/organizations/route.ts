import { NextRequest, NextResponse } from "next/server";
import Organization from "@/models/organization";
import connectMongoDB from "@/lib/connectMongoDB";
import { withAdmin } from "@/lib/utils/withAdmin";
import { getOrSetCache } from "@/lib/redisHelper";
import { deleteCache } from "@/lib/redisHelper";
import "@/models/university";

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();
    const data = await req.json();

    const {
      name,
      emailDomain,
      contactEmail,
      logo,
      phone,
      website,
      description,
      htmlDescription,
      socialLinks,
      location,
      address,
      city,
      state,
      country,
      pincode,
      mapUrl,
      orgType,
      slug,
      contributionType,
    } = data;

    const newOrganization = await Organization.create({
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
      location: location || { type: "Point", coordinates: [0, 0] },
      mapUrl: mapUrl || "",
      orgType,
      slug,
      contributionType,
    });

    await deleteCache(/organizations:page:.*/);

    return NextResponse.json(newOrganization);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
});

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const cacheKey = `organizations:page:${page}:limit:${limit}`;

    const cachedData = await getOrSetCache(cacheKey, async () => {
      const organizations = await Organization.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const totalCount = await Organization.countDocuments();
      return { organizations, totalCount: Math.ceil(totalCount / limit) };
    });

    return NextResponse.json(cachedData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
});
