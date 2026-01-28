"use client";

import { useEffect, useState, useCallback } from "react";
import PlaceListItem from "./hero-ui/place-list-item";
import { Button, Chip } from "@heroui/react";
import { RefreshCw, Sparkles, TrendingUp } from "lucide-react";

type RecommendedCourse = {
  courseId: string;
  score: number;
  reason: string;
  sources: string[];
  course: {
    _id: string;
    course_name: string;
    course_image?: string;
    slug: string;
    rating?: number;
    htmlDescription?: string;
    description?: string;
    tags?: string[];
    price?: number;
    organization?: {
      name: string;
      logo?: string;
      _id: string;
    };
    instructors?: Array<{
      first_name: string;
      last_name: string;
      email: string;
      clerk_id: string;
      profile_image_url: string;
    }>;
  };
};

interface RecommendedCoursesProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function RecommendedCourses({
  limit = 8,
  showHeader = true,
  className = "",
}: RecommendedCoursesProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const res = await fetch(
          `/api/recommendations?limit=${limit}&refresh=${forceRefresh}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) {
          if (res.status === 401) {
            setError("Please sign in to see personalized recommendations");
            return;
          }
          throw new Error("Failed to fetch recommendations");
        }

        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations. Please try again.");
        setRecommendations([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchRecommendations();
  }, [limit, fetchRecommendations]);

  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "onboarding":
        return <Sparkles className="h-4 w-4" />;
      case "trending":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "onboarding":
        return "Based on your interests";
      case "collaborative":
        return "Users like you enjoyed";
      case "content-based":
        return "Similar to courses you liked";
      case "trending":
        return "Trending now";
      case "hybrid":
        return "Personalized for you";
      default:
        return "Recommended";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "onboarding":
        return "primary";
      case "collaborative":
        return "secondary";
      case "content-based":
        return "success";
      case "trending":
        return "warning";
      case "hybrid":
        return "primary";
      default:
        return "default";
    }
  };

  if (error) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <div className="mb-6">
            <h2 className="mb-2 text-3xl font-bold">Recommended For You</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-3xl font-bold">
              <Sparkles className="h-8 w-8 text-blue-500" />
              Recommended For You
            </h2>
            <p className="text-gray-400">
              Courses picked just for you based on your interests and activity
            </p>
          </div>
          <Button
            isIconOnly
            variant="flat"
            className="bg-gray-800 hover:bg-gray-700"
            onPress={handleRefresh}
            isLoading={refreshing}
            isDisabled={loading}
          >
            {!refreshing && <RefreshCw className="h-5 w-5" />}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: limit }).map((_, i) => (
              <PlaceListItem
                key={`loading-${i}`}
                id={`loading-${i}`}
                name=""
                href=""
                price={0}
                imageSrc=""
                isLoading
                tags={[]}
                organization={undefined}
              />
            ))
          : recommendations.length > 0 &&
            recommendations.map((rec) => (
              <div key={rec.course._id} className="relative">
                {/* Recommendation Reason Badge */}
                {rec.reason && (
                  <div className="absolute -top-2 left-2 z-20">
                    <Chip
                      startContent={getReasonIcon(rec.reason)}
                      variant="flat"
                      color={getReasonColor(rec.reason) as any}
                      size="sm"
                      className="text-xs"
                    >
                      {getReasonLabel(rec.reason)}
                    </Chip>
                  </div>
                )}

                <PlaceListItem
                  id={rec.course._id}
                  name={rec.course.course_name}
                  href={`/courses/${rec.course.slug}`}
                  slug={rec.course.slug}
                  price={rec.course.price || null}
                  imageSrc={rec.course.course_image || "/placeholder.png"}
                  tags={rec.course.tags || []}
                  description={rec.course.description}
                  htmlDescription={rec.course.htmlDescription}
                  organization={rec.course.organization}
                  instructor={
                    rec.course.instructors && rec.course.instructors.length > 0
                      ? rec.course.instructors[0]
                      : undefined
                  }
                  rating={rec.course.rating}
                />
              </div>
            ))}
      </div>

      {!loading && recommendations.length === 0 && (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h3 className="mb-2 text-xl font-semibold text-gray-300">
            No recommendations yet
          </h3>
          <p className="mb-4 text-gray-400">
            Complete your onboarding or start exploring courses to get
            personalized recommendations
          </p>
          <Button
            as="a"
            href="/courses"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Browse All Courses
          </Button>
        </div>
      )}
    </div>
  );
}
