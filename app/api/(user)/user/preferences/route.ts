import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/connectMongoDB";
import UserPreferences from "@/models/userPreferences";
import User from "@/models/userModel";

// Types
interface Interest {
  categoryId: string;
  categoryName: string;
  priority?: number;
}

interface PreferencesBody {
  interests: Interest[];
  skillLevel?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

// GET - Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preferences = await UserPreferences.findOne({
      userId: user._id,
    }).populate("interests.categoryId");

    if (!preferences) {
      return NextResponse.json({
        success: true,
        preferences: null,
        message: "No preferences found",
      });
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

// POST - Create/Update user preferences (used during onboarding)
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: PreferencesBody = await request.json();
    const { interests, skillLevel, priceRange } = body;

    // Validate interests
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: "At least one interest is required" },
        { status: 400 },
      );
    }

    if (interests.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 interests allowed" },
        { status: 400 },
      );
    }

    // Transform interests to include priority based on selection order
    const interestsWithPriority = interests.map((interest, index) => ({
      categoryId: interest.categoryId,
      categoryName: interest.categoryName,
      priority: Math.max(1, 5 - index), // First selection gets priority 5, second gets 4, etc.
    }));

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        interests: interestsWithPriority,
        skillLevel: skillLevel || "all",
        priceRange: priceRange || { min: 0, max: 10000 },
        completedOnboarding: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true },
    ).populate("interests.categoryId");

    return NextResponse.json({
      success: true,
      preferences,
      message: "Preferences saved successfully",
    });
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 },
    );
  }
}

// PUT - Update existing preferences
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: Partial<PreferencesBody> = await request.json();
    const { interests, skillLevel, priceRange } = body;

    const updateData: any = {
      lastUpdated: new Date(),
    };

    if (interests) {
      if (interests.length > 5) {
        return NextResponse.json(
          { error: "Maximum 5 interests allowed" },
          { status: 400 },
        );
      }

      updateData.interests = interests.map((interest, index) => ({
        categoryId: interest.categoryId,
        categoryName: interest.categoryName,
        priority: interest.priority || Math.max(1, 5 - index),
      }));
    }

    if (skillLevel) {
      updateData.skillLevel = skillLevel;
    }

    if (priceRange) {
      updateData.priceRange = priceRange;
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: user._id },
      { $set: updateData },
      { new: true },
    ).populate("interests.categoryId");

    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      preferences,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
