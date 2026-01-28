"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlaceListItem from "./hero-ui/place-list-item";
import { Button } from "@heroui/react";

type PopularCourse = {
  _id: string; // from /api/courses/popular
  course_name: string;
  course_image?: string; // optional in case some are missing
  slug: string;
  rating?: number;
  htmlDescription?: string;
  description?: string; // optional in case some are missing
  tags?: string[]; // optional in case some are missing
  organization?: {
    name: string;
    logo?: string;
    _id: string;
  };
  // Note: popular API doesn't return image/tags; we’ll use fallbacks
};

export default function PopularCourses() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<PopularCourse[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses/popular", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          console.error("Error fetching popular courses:", error);
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <div className="flex items-center">
        <h1 className="my-8 text-xl md:min-w-[40%] md:text-5xl">
          Popular Courses
        </h1>

        {/* Mobile: Button after h1 */}
        <div className="ml-auto md:hidden">
          <Button
            as={Link}
            href="/courses?sort=popular"
            size="sm"
            className="min-w-[100px] underline"
            variant="light"
          >
            View More
          </Button>
        </div>

        {/* Desktop: Border div */}
        <div className="hidden h-0.5 flex-1 bg-[#333333] md:block"></div>

        {/* Desktop: Button after border div */}
        <div className="hidden md:ml-4 md:block">
          <Button
            as={Link}
            href="/courses?sort=popular"
            variant="light"
            className="min-w-[120px] text-base"
          >
            View More
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
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
          : courses.length > 0 &&
            courses.map((course) => (
              <PlaceListItem
                key={course._id}
                id={course._id}
                name={course.course_name}
                href={`/courses/${course.slug}`}
                slug={course.slug}
                price={null} // popular list likely doesn't include price
                imageSrc={course.course_image || "/placeholder.png"} // fallback image; replace if you have one
                tags={course.tags || []} // API doesn't return tags here
                description={course.description}
                htmlDescription={course.htmlDescription}
                organization={course.organization}
              />
            ))}
      </div>
    </div>
  );
}
