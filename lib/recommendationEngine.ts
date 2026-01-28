import UserInteraction from "@/models/userInteraction";
import UserSimilarity from "@/models/userSimilarity";
import Recommendation from "@/models/recommendation";
import Course from "@/models/course";
import UserPreferences from "@/models/userPreferences";

interface ActionWeights {
  view: number;
  like: number;
  enroll: number;
  watch: number;
  complete: number;
}

interface RecommendationItem {
  courseId: string;
  score: number;
  reason: string;
  sources: string[];
  course?: any;
}

interface SimilarUser {
  userId: string;
  similarity: number;
  updatedAt: Date;
}

class RecommendationEngine {
  // Action weights for scoring
  static WEIGHTS: ActionWeights = {
    view: 1,
    like: 3,
    enroll: 5,
    watch: 2,
    complete: 10,
  };

  /**
   * Log user activity
   */
  static async logActivity(
    userId: string,
    courseId: string,
    actionType: keyof ActionWeights,
  ): Promise<any> {
    try {
      const weight = this.WEIGHTS[actionType] || 1;

      let interaction = await UserInteraction.findOne({ userId, courseId });

      if (interaction) {
        interaction.actions.push({
          type: actionType,
          weight,
          timestamp: new Date(),
        });
        interaction.score += weight;
      } else {
        interaction = new UserInteraction({
          userId,
          courseId,
          actions: [
            {
              type: actionType,
              weight,
            },
          ],
          score: weight,
        });
      }

      await interaction.save();
      return interaction;
    } catch (error) {
      console.error("Error logging activity:", error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two users
   */
  static calculateCosineSimilarity(
    user1Interactions: any[],
    user2Interactions: any[],
  ): number {
    const user1Map = new Map(
      user1Interactions.map((i) => [i.courseId.toString(), i.score]),
    );
    const user2Map = new Map(
      user2Interactions.map((i) => [i.courseId.toString(), i.score]),
    );

    const commonCourses = [...user1Map.keys()].filter((courseId) =>
      user2Map.has(courseId),
    );

    if (commonCourses.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    commonCourses.forEach((courseId) => {
      const score1 = user1Map.get(courseId)!;
      const score2 = user2Map.get(courseId)!;
      dotProduct += score1 * score2;
    });

    user1Interactions.forEach((i) => {
      norm1 += i.score * i.score;
    });

    user2Interactions.forEach((i) => {
      norm2 += i.score * i.score;
    });

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Calculate user similarities (collaborative filtering)
   */
  static async calculateUserSimilarities(
    userId: string,
    limit: number = 10,
  ): Promise<SimilarUser[]> {
    try {
      const userInteractions = await UserInteraction.find({ userId });

      if (userInteractions.length === 0) {
        return [];
      }

      // Get all other users who have interacted with courses
      const allUsers = await UserInteraction.distinct("userId");
      const otherUsers = allUsers.filter((id: string) => id !== userId);

      const similarities: SimilarUser[] = [];

      for (const otherUserId of otherUsers) {
        const otherUserInteractions = await UserInteraction.find({
          userId: otherUserId,
        });

        const similarity = this.calculateCosineSimilarity(
          userInteractions,
          otherUserInteractions,
        );

        if (similarity > 0) {
          similarities.push({
            userId: otherUserId,
            similarity,
            updatedAt: new Date(),
          });
        }
      }

      // Sort by similarity and take top N
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topSimilarities = similarities.slice(0, limit);

      // Save to database
      await UserSimilarity.findOneAndUpdate(
        { userId },
        {
          userId,
          similarUsers: topSimilarities,
          lastCalculated: new Date(),
        },
        { upsert: true, new: true },
      );

      return topSimilarities;
    } catch (error) {
      console.error("Error calculating similarities:", error);
      throw error;
    }
  }

  /**
   * Get collaborative filtering recommendations
   */
  static async getCollaborativeRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendationItem[]> {
    try {
      // Get similar users
      let userSimilarity = await UserSimilarity.findOne({ userId });

      if (!userSimilarity || userSimilarity.similarUsers.length === 0) {
        await this.calculateUserSimilarities(userId);
        userSimilarity = await UserSimilarity.findOne({ userId });
      }

      if (!userSimilarity) return [];

      // Get user's already interacted courses
      const userCourses = await UserInteraction.find({ userId }).distinct(
        "courseId",
      );

      // Get courses liked by similar users
      const courseScores = new Map<string, number>();

      for (const similarUser of userSimilarity.similarUsers) {
        const interactions = await UserInteraction.find({
          userId: similarUser.userId,
        });

        interactions.forEach((interaction) => {
          const courseIdStr = interaction.courseId.toString();

          // Skip if user already interacted with this course
          if (userCourses.some((c: any) => c.toString() === courseIdStr)) {
            return;
          }

          const weightedScore = interaction.score * similarUser.similarity;

          if (courseScores.has(courseIdStr)) {
            courseScores.set(
              courseIdStr,
              courseScores.get(courseIdStr)! + weightedScore,
            );
          } else {
            courseScores.set(courseIdStr, weightedScore);
          }
        });
      }

      // Convert to array and sort
      const recommendations: RecommendationItem[] = Array.from(
        courseScores.entries(),
      )
        .map(([courseId, score]) => ({
          courseId,
          score,
          reason: "collaborative",
          sources: ["similar_users"],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error("Error getting collaborative recommendations:", error);
      throw error;
    }
  }

  /**
   * Calculate course similarity based on content
   */
  static calculateCourseSimilarity(course1: any, course2: any): number {
    let score = 0;

    // Categories match (handling arrays)
    if (course1.categories && course2.categories) {
      const cats1 = new Set(course1.categories.map((c: any) => c.toString()));
      const cats2 = new Set(course2.categories.map((c: any) => c.toString()));
      const commonCats = [...cats1].filter((cat) => cats2.has(cat));
      if (commonCats.length > 0) {
        score += 0.4;
      }
    }

    // Tags match
    if (course1.tags && course2.tags) {
      const tags1 = new Set(course1.tags);
      const tags2 = new Set(course2.tags);
      const commonTags = [...tags1].filter((tag) => tags2.has(tag));
      score += (commonTags.length / Math.max(tags1.size, tags2.size)) * 0.3;
    }

    // Similar pricing
    if (course1.price && course2.price) {
      const priceDiff = Math.abs(course1.price - course2.price);
      const maxPrice = Math.max(course1.price, course2.price);
      score += (1 - priceDiff / maxPrice) * 0.2;
    }

    return score;
  }

  /**
   * Get content-based recommendations
   */
  static async getContentBasedRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendationItem[]> {
    try {
      // Get user's highly rated courses
      const userInteractions = await UserInteraction.find({ userId })
        .sort({ score: -1 })
        .limit(5)
        .populate("courseId");

      if (userInteractions.length === 0) return [];

      const userCourseIds = userInteractions.map((i) =>
        i.courseId._id.toString(),
      );

      // Get all courses except user's courses
      const allCourses = await Course.find({
        _id: { $nin: userCourseIds },
        status: "approved",
      });

      const courseScores = new Map<string, number>();

      // Calculate similarity with each course
      userInteractions.forEach((interaction) => {
        const userCourse = interaction.courseId;
        const interactionWeight = interaction.score;

        allCourses.forEach((course) => {
          const similarity = this.calculateCourseSimilarity(userCourse, course);

          const weightedScore = similarity * interactionWeight;
          const courseIdStr = course._id.toString();

          if (courseScores.has(courseIdStr)) {
            courseScores.set(
              courseIdStr,
              courseScores.get(courseIdStr)! + weightedScore,
            );
          } else {
            courseScores.set(courseIdStr, weightedScore);
          }
        });
      });

      const recommendations: RecommendationItem[] = Array.from(
        courseScores.entries(),
      )
        .map(([courseId, score]) => ({
          courseId,
          score,
          reason: "content-based",
          sources: ["course_similarity"],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error("Error getting content-based recommendations:", error);
      throw error;
    }
  }

  /**
   * Get trending courses
   */
  static async getTrendingRecommendations(
    limit: number = 10,
  ): Promise<RecommendationItem[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trending = await UserInteraction.aggregate([
        {
          $match: {
            "actions.timestamp": { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: "$courseId",
            totalScore: { $sum: "$score" },
            userCount: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            courseId: "$_id",
            score: {
              $multiply: ["$totalScore", { $size: "$userCount" }],
            },
          },
        },
        { $sort: { score: -1 } },
        { $limit: limit },
      ]);

      return trending.map((item) => ({
        courseId: item.courseId.toString(),
        score: item.score,
        reason: "trending",
        sources: ["popularity"],
      }));
    } catch (error) {
      console.error("Error getting trending recommendations:", error);
      throw error;
    }
  }

  /**
   * Generate hybrid recommendations
   */
  static async generateRecommendations(
    userId: string,
    limit: number = 20,
  ): Promise<RecommendationItem[]> {
    try {
      const [collaborative, contentBased, trending] = await Promise.all([
        this.getCollaborativeRecommendations(userId, limit),
        this.getContentBasedRecommendations(userId, limit),
        this.getTrendingRecommendations(limit),
      ]);

      // Merge and weight recommendations
      const allRecommendations = new Map<string, RecommendationItem>();

      // Weight: Collaborative 50%, Content-based 35%, Trending 15%
      const weights: Record<string, number> = {
        collaborative: 0.5,
        "content-based": 0.35,
        trending: 0.15,
      };

      [collaborative, contentBased, trending].forEach((recs) => {
        recs.forEach((rec) => {
          const courseId = rec.courseId.toString();
          const weightedScore = rec.score * weights[rec.reason];

          if (allRecommendations.has(courseId)) {
            const existing = allRecommendations.get(courseId)!;
            existing.score += weightedScore;
            existing.sources.push(...rec.sources);
            existing.reason = "hybrid";
          } else {
            allRecommendations.set(courseId, {
              ...rec,
              score: weightedScore,
            });
          }
        });
      });

      const finalRecommendations = Array.from(allRecommendations.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Save to database
      await Recommendation.findOneAndUpdate(
        { userId },
        {
          userId,
          recommendations: finalRecommendations,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true },
      );

      return finalRecommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  }

  static blendRecommendations(
    recommendationSets: RecommendationItem[][],
    weights: number[],
    limit: number,
  ): RecommendationItem[] {
    const allRecommendations = new Map<string, RecommendationItem>();

    recommendationSets.forEach((recs, index) => {
      const weight = weights[index];

      recs.forEach((rec) => {
        const courseId = rec.courseId.toString();
        const weightedScore = rec.score * weight;

        if (allRecommendations.has(courseId)) {
          const existing = allRecommendations.get(courseId)!;
          existing.score += weightedScore;
          existing.sources.push(...rec.sources);
          existing.reason = "hybrid";
        } else {
          allRecommendations.set(courseId, {
            ...rec,
            score: weightedScore,
          });
        }
      });
    });

    return Array.from(allRecommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get recommendations for user
   */
  static async getRecommendations(
    userId: string,
    limit: number = 20,
    forceRefresh: boolean = false,
  ): Promise<RecommendationItem[]> {
    try {
      // Check if user has completed onboarding
      const preferences = await UserPreferences.findOne({ userId });
      const hasInteractions = await UserInteraction.countDocuments({
        userId,
      });

      console.log("Getting recommendations for user:", {
        userId,
        hasPreferences: !!preferences,
        interactionCount: hasInteractions,
      });

      // Cold start: New user with preferences but no interactions
      if (preferences && hasInteractions < 3) {
        console.log("Using onboarding recommendations (cold start)");
        return await this.getOnboardingRecommendations(userId, limit);
      }

      // Warm start: User has some interactions
      if (hasInteractions >= 3 && hasInteractions < 10) {
        console.log("Using blended recommendations (warm start)");

        const [onboarding, collaborative, trending] = await Promise.all([
          this.getOnboardingRecommendations(userId, limit),
          this.getCollaborativeRecommendations(userId, limit / 2),
          this.getTrendingRecommendations(limit / 2),
        ]);

        return this.blendRecommendations(
          [onboarding, collaborative, trending],
          [0.4, 0.3, 0.3],
          limit,
        );
      }

      // Existing user logic (original implementation)
      if (!forceRefresh) {
        const existing = await Recommendation.findOne({ userId });

        if (existing) {
          const hoursSinceUpdate =
            (Date.now() - existing.lastUpdated.getTime()) / (1000 * 60 * 60);

          if (hoursSinceUpdate < 24) {
            console.log("Using cached recommendations");

            const courseIds = existing.recommendations
              .slice(0, limit)
              .map((r: any) => r.courseId);

            const courses = await Course.find({
              _id: { $in: courseIds },
            }).lean();

            return existing.recommendations.slice(0, limit).map((rec: any) => {
              const course = courses.find(
                (c: any) => c._id.toString() === rec.courseId.toString(),
              );
              return { ...rec, course };
            });
          }
        }
      }

      console.log("Generating new hybrid recommendations");

      const recommendations = await this.generateRecommendations(userId, limit);

      const courseIds = recommendations.map((r) => r.courseId);
      const courses = await Course.find({
        _id: { $in: courseIds },
      }).lean();

      return recommendations.map((rec) => {
        const course = courses.find(
          (c: any) => c._id.toString() === rec.courseId.toString(),
        );
        return { ...rec, course };
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }

  /**
   * Get onboarding recommendations based on user preferences
   */
  static async getOnboardingRecommendations(
    userId: string,
    limit: number = 20,
  ): Promise<RecommendationItem[]> {
    try {
      const preferences = await UserPreferences.findOne({ userId });

      console.log("Onboarding recommendations - User preferences:", {
        found: !!preferences,
        interestsCount: preferences?.interests?.length || 0,
      });

      if (!preferences || preferences.interests.length === 0) {
        console.log("No preferences found, falling back to trending");
        return await this.getTrendingRecommendations(limit);
      }

      // Build query based on user preferences
      const query: any = {
        status: "approved",
      };

      // Filter by categories
      if (preferences.interests.length > 0) {
        const categoryIds = preferences.interests.map((i: any) => i.categoryId);
        console.log("Filtering by category IDs:", categoryIds);
        query.categories = { $in: categoryIds };
      }

      // Filter by price range
      if (preferences.priceRange) {
        query.price = {
          $gte: preferences.priceRange.min,
          $lte: preferences.priceRange.max,
        };
      }

      console.log("Course query:", JSON.stringify(query, null, 2));

      // Get courses matching preferences
      const courses = await Course.find(query)
        .sort({ rating: -1, views: -1 })
        .limit(limit)
        .lean();

      console.log(`Found ${courses.length} courses matching user preferences`);

      if (courses.length === 0) {
        console.log(
          "No courses found matching preferences, falling back to trending",
        );
        return await this.getTrendingRecommendations(limit);
      }

      // Score courses based on preference priority
      const recommendations: RecommendationItem[] = courses.map((course) => {
        let score = course.rating || 0;

        // Boost score based on category priority
        if (course.categories && course.categories.length > 0) {
          let maxPriority = 0;

          preferences.interests.forEach((interest: any) => {
            const interestCategoryId = interest.categoryId.toString();

            // Check if this interest's category matches any of the course's categories
            const hasMatch = course.categories.some(
              (courseCat: any) => courseCat.toString() === interestCategoryId,
            );

            if (hasMatch && interest.priority > maxPriority) {
              maxPriority = interest.priority;
            }
          });

          if (maxPriority > 0) {
            score += maxPriority * 2;
          }
        }

        // Boost popular courses
        if (course.views) {
          score += Math.log(course.views + 1) * 0.5;
        }

        // Ensure course._id is converted to a string safely (handles unknown typings)
        const rawId = (course as any)._id;
        const courseIdStr =
          rawId &&
          typeof rawId === "object" &&
          typeof rawId.toString === "function"
            ? rawId.toString()
            : String(rawId);

        return {
          courseId: courseIdStr,
          course,
          score,
          reason: "onboarding",
          sources: ["user_preferences"],
        };
      });

      // Sort by score
      recommendations.sort((a, b) => b.score - a.score);

      console.log(
        `Returning ${recommendations.length} onboarding recommendations`,
      );

      return recommendations;
    } catch (error) {
      console.error("Error getting onboarding recommendations:", error);
      console.error("Error stack:", error);
      throw error;
    }
  }
}

export default RecommendationEngine;
