// app/api/admin/courses/[id]/pricing/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import { withAdmin } from "@/lib/utils/withAdmin";

/**
 * GET /api/admin/courses/[id]/pricing
 * Retrieve pricing information for a course
 */
export const GET = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 },
        );
      }

      const course = await Course.findById(id).select(
        "isPaid price discountedPrice discount discountType course_name",
      );

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          courseId: course._id,
          courseName: course.course_name,
          isPaid: course.isPaid || false,
          price: course.price || 0,
          discountedPrice: course.discountedPrice || 0,
          discount: course.discount || 0,
          discountType: course.discountType || "percentage",
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error fetching course pricing:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);

/**
 * PUT /api/admin/courses/[id]/pricing
 * Update pricing information for a course
 */
export const PUT = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const { isPaid, price, discount, discountType, discountedPrice } = body;

      // Validation
      if (typeof isPaid !== "boolean") {
        return NextResponse.json(
          { error: "isPaid must be a boolean" },
          { status: 400 },
        );
      }

      if (isPaid) {
        // Validate price
        if (typeof price !== "number" || price < 0) {
          return NextResponse.json(
            { error: "Price must be a positive number" },
            { status: 400 },
          );
        }

        // Validate discount
        if (typeof discount !== "number" || discount < 0) {
          return NextResponse.json(
            { error: "Discount must be a non-negative number" },
            { status: 400 },
          );
        }

        // Validate discount type
        if (!["percentage", "fixed"].includes(discountType)) {
          return NextResponse.json(
            { error: "Discount type must be 'percentage' or 'fixed'" },
            { status: 400 },
          );
        }

        // Validate percentage discount
        if (discountType === "percentage" && discount > 100) {
          return NextResponse.json(
            { error: "Percentage discount cannot exceed 100%" },
            { status: 400 },
          );
        }

        // Validate fixed discount
        if (discountType === "fixed" && discount > price) {
          return NextResponse.json(
            { error: "Fixed discount cannot exceed base price" },
            { status: 400 },
          );
        }

        // Validate discounted price
        if (typeof discountedPrice !== "number" || discountedPrice < 0) {
          return NextResponse.json(
            { error: "Discounted price must be a non-negative number" },
            { status: 400 },
          );
        }

        if (discountedPrice > price) {
          return NextResponse.json(
            { error: "Discounted price cannot exceed base price" },
            { status: 400 },
          );
        }
      }

      // Find and update course
      const course = await Course.findById(id);

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      // Update pricing fields
      course.isPaid = isPaid;
      course.price = isPaid ? price : 0;
      course.discount = isPaid ? discount : 0;
      course.discountType = isPaid ? discountType : "percentage";
      course.discountedPrice = isPaid ? discountedPrice : 0;

      await course.save();

      return NextResponse.json(
        {
          message: "Course pricing updated successfully",
          course: {
            _id: course._id,
            course_name: course.course_name,
            isPaid: course.isPaid,
            price: course.price,
            discount: course.discount,
            discountType: course.discountType,
            discountedPrice: course.discountedPrice,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error updating course pricing:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);

/**
 * PATCH /api/admin/courses/[id]/pricing
 * Partially update pricing (e.g., toggle isPaid only)
 */
export const PATCH = withAdmin<{ params: { id: string } }>(
  async (req, { params }) => {
    try {
      await connectMongoDB();
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const updateFields: any = {};

      // Build update object only with provided fields
      if (typeof body.isPaid === "boolean") {
        updateFields.isPaid = body.isPaid;

        // If setting to free, reset pricing fields
        if (!body.isPaid) {
          updateFields.price = 0;
          updateFields.discount = 0;
          updateFields.discountedPrice = 0;
        }
      }

      if (typeof body.price === "number" && body.price >= 0) {
        updateFields.price = body.price;
      }

      if (typeof body.discount === "number" && body.discount >= 0) {
        updateFields.discount = body.discount;
      }

      if (
        body.discountType &&
        ["percentage", "fixed"].includes(body.discountType)
      ) {
        updateFields.discountType = body.discountType;
      }

      if (
        typeof body.discountedPrice === "number" &&
        body.discountedPrice >= 0
      ) {
        updateFields.discountedPrice = body.discountedPrice;
      }

      // Update course
      const course = await Course.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
      }).select(
        "isPaid price discountedPrice discount discountType course_name",
      );

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          message: "Course pricing updated successfully",
          course: {
            _id: course._id,
            course_name: course.course_name,
            isPaid: course.isPaid,
            price: course.price,
            discount: course.discount,
            discountType: course.discountType,
            discountedPrice: course.discountedPrice,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error updating course pricing:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
