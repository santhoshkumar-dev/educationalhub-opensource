export const dynamic = "force-dynamic";

import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
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
          { error: "Course ID missing" },
          { status: 400 },
        );
      }

      const course = await Course.findById(id)
        .populate(
          "instructors",
          "username first_name last_name email profile_image_url",
        )
        .populate("institution", "name slug logo")
        .populate("organization", "name slug logo");

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(course, { status: 200 });
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
          { error: "Course ID missing" },
          { status: 400 },
        );
      }

      // Optional: auto-generate new slug if title changes
      if (body.title) {
        body.slug = body.title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "");
      }

      // Update timestamps
      body.updated_at = new Date();

      const updatedCourse = await Course.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      })
        .populate(
          "instructor",
          "username first_name last_name email profile_image_url",
        )
        .populate("institution", "name slug logo")
        .populate("organization", "name slug logo");

      if (!updatedCourse) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      // Clear relevant cache patterns
      await deleteCache(/courses:page:.*/);
      await deleteCache(`course:${updatedCourse.slug}`);

      return NextResponse.json(updatedCourse, { status: 200 });
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
          { error: "Course ID missing" },
          { status: 400 },
        );
      }

      // Get course details before deletion for cache cleanup
      const course = await Course.findById(id);

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      const deletedCourse = await Course.findByIdAndDelete(id);

      // Clear relevant cache patterns
      await deleteCache(/courses:page:.*/);
      await deleteCache(`course:${course.slug}`);

      return NextResponse.json(
        { message: "Course deleted successfully" },
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
