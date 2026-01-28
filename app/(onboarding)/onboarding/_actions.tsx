"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import UserPreferences from "@/models/userPreferences";

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  try {
    const institution = formData.get("institutionId") as string | null;
    const organization = formData.get("organizationId") as string | null;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const instagram = formData.get("instagram") as string;
    const facebook = formData.get("facebook") as string;
    const twitter = formData.get("twitter") as string;
    const website = formData.get("website") as string;
    const linkedin = formData.get("linkedin") as string;
    const interestsString = formData.get("interests") as string;

    // Parse interests from JSON string
    let interests = [];
    if (interestsString) {
      try {
        interests = JSON.parse(interestsString);
      } catch (e) {
        console.error("Error parsing interests:", e);
      }
    }

    // Update Clerk metadata
    const res = await clerkClient().users.updateUser(userId, {
      privateMetadata: {
        onboardingComplete: true,
        role: formData.get("role"),
        institution: institution || undefined,
        organization: organization || undefined,
      },
    });

    await connectMongoDB();

    // Update user basic info
    const updateData: any = {
      role: formData.get("role"),
      onboardingComplete: true,
      first_name: firstName,
      last_name: lastName,
    };

    // Only add institution and organization for instructors
    if (institution) {
      updateData.institution = institution;
    }
    if (organization) {
      updateData.organization = organization;
    }

    // Add social media fields if they're provided
    if (instagram) updateData.instagram = instagram;
    if (facebook) updateData.facebook = facebook;
    if (twitter) updateData.twitter = twitter;
    if (website) updateData.website = website;
    if (linkedin) updateData.linkedin = linkedin;

    const user = await User.findOneAndUpdate(
      { clerk_id: userId },
      { $set: updateData },
      { new: true },
    );

    console.log("User updated in MongoDB:", user);

    // Save user preferences (interests) - Direct implementation (same logic as API)
    if (interests && interests.length > 0) {
      try {
        // Validate interests
        if (!Array.isArray(interests) || interests.length === 0) {
          console.error("Invalid interests data");
          return { error: "At least one interest is required" };
        }

        if (interests.length > 5) {
          console.error("Too many interests selected");
          return { error: "Maximum 5 interests allowed" };
        }

        // Transform interests to include priority based on selection order
        // First selection gets priority 5, second gets 4, etc.
        const interestsWithPriority = interests.map((interest, index) => ({
          categoryId: interest.categoryId,
          categoryName: interest.categoryName,
          priority: Math.max(1, 5 - index),
        }));

        const user = await User.findOne({ clerk_id: userId });
        if (!user) {
          console.error("User not found for saving preferences");
          return { error: "User not found" };
        }

        // Save preferences to database (upsert operation)
        const preferences = await UserPreferences.findOneAndUpdate(
          { userId: user._id },
          {
            userId: user._id,
            interests: interestsWithPriority,
            skillLevel: "all", // Default value
            priceRange: { min: 0, max: 10000 }, // Default value
            completedOnboarding: true,
            lastUpdated: new Date(),
          },
          { upsert: true, new: true },
        ).populate("interests.categoryId");

        console.log("Preferences saved successfully:", preferences);
      } catch (error) {
        console.error("Error saving preferences:", error);
        // Don't fail the whole onboarding if preferences fail
        // Just log the error and continue
      }
    }

    return { message: res.privateMetadata };
  } catch (err) {
    console.error("Error in completeOnboarding:", err);
    return { error: "There was an error updating the user metadata." };
  }
};
