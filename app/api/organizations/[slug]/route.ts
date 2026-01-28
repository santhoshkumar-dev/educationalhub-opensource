import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Organization from "@/models/organization";
import Course from "@/models/course";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    await connectMongoDB();
    const { slug } = params;
    const organization = await Organization.findOne({ slug });
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const courses = await Course.find({
      organization: organization._id,
    })
      .populate("organization", "name logo _id")
      .select(
        "id course_name slug rating course_image htmlDescription description organization tags",
      );

    return NextResponse.json({ organization, courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
