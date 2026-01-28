import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Organization from "@/models/organization";
import { withAdmin } from "@/lib/utils/withAdmin";

export const GET = withAdmin<{ params: { id: string } }>(
  async (_, { params }) => {
    await connectMongoDB();
    const organization = await Organization.findById(params.id);
    if (!organization)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(organization);
  },
);

export const PUT = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      let data = await req.json();
      const { slug, ...rest } = data;
      data = rest;

      const updated = await Organization.findByIdAndUpdate(params.id, data, {
        new: true,
      });

      if (!updated)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(updated);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
);

export const DELETE = withAdmin<{ params: { id: string } }>(
  async (_, { params }) => {
    await connectMongoDB();
    await Organization.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  },
);
