import { NextRequest, NextResponse } from "next/server";
import Resource from "@/models/resources";
import connectMongoDB from "@/lib/connectMongoDB";

const API_TOKEN = process.env.API_TOKEN;

// GET /api/resources

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const resources = await Resource.find();

    return NextResponse.json({ resources });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract the API token from the headers
    const apiToken = req.headers.get("x-api-token");

    // Check if the API token matches
    if (!apiToken || apiToken !== API_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body to extract category and resource details
    const body = await req.json();
    const { category, resources } = body;

    // Validate the input data
    if (!category || !resources || !Array.isArray(resources)) {
      return NextResponse.json(
        { error: "Category and resources are required" },
        { status: 400 },
      );
    }

    // Connect to the database
    await connectMongoDB();

    // Check if the category already exists
    let existingCategory = await Resource.findOne({ category });

    if (existingCategory) {
      // If category exists, add new resources to the existing array
      existingCategory.resources.push(...resources);
      await existingCategory.save();
    } else {
      const newCategory = new Resource({
        category,
        resources,
      });

      await newCategory.save();
    }

    return NextResponse.json(
      { message: "Resources added successfully!" },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
