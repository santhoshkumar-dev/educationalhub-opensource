export const dynamic = "force-dynamic";

import connectMongoDB from "@/lib/connectMongoDB";
import University from "@/models/university";
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/utils/withAdmin";

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const generateSlug = (name: string) =>
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

    let baseSlug = generateSlug(name);
    let slug = baseSlug;

    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await University.findOne({ slug });
      if (!existing) {
        isUnique = true;
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        slug = `${baseSlug}-${randomNum}`;
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Unable to generate a unique slug" },
        { status: 500 },
      );
    }

    return NextResponse.json({ slug }, { status: 200 });
  } catch (error) {
    console.error("Error generating university slug:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
