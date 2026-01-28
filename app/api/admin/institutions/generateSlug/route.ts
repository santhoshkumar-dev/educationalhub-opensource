export const dynamic = "force-dynamic";

import connectMongoDB from "@/lib/connectMongoDB";
import Institution from "@/models/institution";
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/utils/withAdmin";

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    await connectMongoDB();

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Step 1: Base slug generator
    const generateSlug = (name: string) =>
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

    // Step 2: Generate base slug
    let baseSlug = generateSlug(name);
    let slug = baseSlug;

    // Step 3: Check for uniqueness, append random suffix if exists
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await Institution.findOne({ slug });
      if (!existing) {
        isUnique = true;
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random
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
    console.error("Error generating slug:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
});
