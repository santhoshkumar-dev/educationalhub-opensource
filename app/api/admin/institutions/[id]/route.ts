export const dynamic = "force-dynamic";

import connectMongoDB from "@/lib/connectMongoDB";
import Institution from "@/models/institution";
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/utils/withAdmin";
import { deleteCache } from "@/lib/redisHelper";

export const GET = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { error: "Institution ID missing" },
          { status: 400 },
        );
      }

      const institution = await Institution.findById(id);

      if (!institution) {
        return NextResponse.json(
          { error: "Institution not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(institution, { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      const body = await req.json();
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { error: "Institution ID missing" },
          { status: 400 },
        );
      }

      // Optional: auto-generate new slug if name changes
      if (body.name) {
        body.slug = body.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "");
      }

      const updatedInstitution = await Institution.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      if (!updatedInstitution) {
        return NextResponse.json(
          { error: "Institution not found" },
          { status: 404 },
        );
      }

      await deleteCache(/institutions:page:.*/);

      return NextResponse.json(updatedInstitution, { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }
  },
);

// DELETE

export const DELETE = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { error: "Institution ID missing" },
          { status: 400 },
        );
      }

      const deletedInstitution = await Institution.findByIdAndDelete(id);

      if (!deletedInstitution) {
        return NextResponse.json(
          { error: "Institution not found" },
          { status: 404 },
        );
      }

      await deleteCache(/institutions:page:.*/);

      return NextResponse.json(
        { message: "Institution deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 },
      );
    }
  },
);
