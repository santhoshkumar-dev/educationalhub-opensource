import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Course from "@/models/course";

export async function GET(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await connectMongoDB();
    const { username } = params;

    // Find user and populate enrolled course details
    interface PopulatedCourse {
      _id: string;
      course_name: string;
      slug: string;
      rating: number;
      course_image: string;
      htmlDescription: string;
      description: string;
      tags: string[];
      organization?: { _id: string; name: string; logo: string };
      instructors?: {
        first_name: string;
        last_name: string;
        profile_image_url: string;
      }[];
    }

    interface PopulatedUser {
      enrolledCourses: PopulatedCourse[];
    }

    const user = (await User.findOne({ username })
      .populate({
        path: "enrolledCourses",
        model: Course,
        populate: [
          { path: "organization", select: "name logo _id" },
          {
            path: "instructors",
            select: "first_name last_name profile_image_url",
          },
        ],
        select:
          "_id course_name slug rating course_image htmlDescription description organization instructors tags",
      })
      .select("enrolledCourses")
      .lean()) as PopulatedUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { enrolledCourses: user.enrolledCourses || [] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
