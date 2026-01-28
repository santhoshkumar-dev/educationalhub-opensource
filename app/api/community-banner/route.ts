import { NextResponse } from "next/server";
import connectDB from "@/lib/connectMongoDB"; // Your DB connection
import Banner from "@/models/community-banner";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();

    // Get active banners within date range, sorted by priority
    const banners = await Banner.find({
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: today }, endDate: null },
        { startDate: null, endDate: { $gte: today } },
        { startDate: { $lte: today }, endDate: { $gte: today } },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .select("-__v -createdAt -updatedAt")
      .lean();

    return NextResponse.json({
      success: true,
      banners: banners.map((banner) => ({
        id: banner.id,
        text: banner.text,
        buttons: banner.buttons,
      })),
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 },
    );
  }
}
