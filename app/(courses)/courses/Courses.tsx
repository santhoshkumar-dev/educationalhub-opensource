"use client";
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import PlaceListItem from "@/components/hero-ui/place-list-item";
import { CheckboxGroup, Select, SelectItem } from "@heroui/react";
import PopoverFilterWrapper from "@/components/hero-ui/popover-wrapper";
import TagGroupItem from "@/components/hero-ui/tag-group-item";

// Course type definition (unchanged)
type Course = {
  course_name: string;
  course_image: string;
  _id: string;
  total_videos: number;
  slug: string;
  tags: string[];
  isPaid: boolean;
  description?: string;
  htmlDescription?: string;
  instructor: {
    first_name: string;
    last_name: string;
    email: string;
    clerk_id: string;
    profile_image_url: string;
  };
  organization?: {
    name: string;
    logo?: string;
    _id: string;
  };
};

const popularTags = [
  "AI",
  "Python",
  "JavaScript",
  "React",
  "Web Development",
  "AWS",
  "Machine Learning",
  "Full Stack",
  "Next.js",
  "UI/UX",
  "CSS",
  "HTML",
  "Flutter",
  "React Native",
  "Firebase",
  "Git",
  "Beginner",
  "Game Development",
  "ChatGPT",
  "Data Structures",
  "Algorithms",
  "Java",
  "FAANG",
  "Angular",
  "Mobile App Development",
];

export default function Courses() {
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== "undefined") {
      // Check URL parameter first, then localStorage, then default
      const urlSort = searchParams?.get("sort");
      if (urlSort) {
        return urlSort;
      }
      return localStorage.getItem("sortBy") || "popular";
    }
    return "popular";
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchCourses = useCallback(
    async (pageNum: number, replace = false) => {
      try {
        setLoading(true);
        const searchQuery = searchParams?.get("search") ?? "";

        const response = await axios.get("/api/courses", {
          // ⬇️ 2. Pass the sortBy state to the API call
          params: {
            page: pageNum,
            limit: "8",
            search: searchQuery,
            sort: sortBy,
            ...(selectedTags.length > 0 && { tags: selectedTags.join(",") }),
          },
        });

        setTotalCourses(response.data.total);
        const newCourses = response.data.courses || [];
        if (replace) {
          setCourses(newCourses);
        } else {
          setCourses((prev) => [...prev, ...newCourses]);
        }

        setHasMore(pageNum < response.data.totalPages);
      } catch (error) {
        console.error("Error fetching courses:", error);
        if (replace) setCourses([]);
      } finally {
        setLoading(false);
      }
    },
    [searchParams, sortBy, selectedTags],
  );

  useEffect(() => {
    setHydrated(true); // mark client ready
    // Check URL parameter first, then localStorage
    const urlSort = searchParams?.get("sort");
    if (urlSort) {
      setSortBy(urlSort);
    } else {
      const savedSort = localStorage.getItem("sortBy");
      if (savedSort) {
        setSortBy(savedSort);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("sortBy", sortBy);
    }
  }, [sortBy, hydrated]);

  // ⬇️ 3. Reset when search OR sort option changes
  // ⬇️ 3. Reset when search OR sort option changes
  useEffect(() => {
    setPage(1);
    fetchCourses(1, true);
  }, [searchParams, sortBy, selectedTags, fetchCourses]); // Add sortBy to dependency array

  // Infinite scroll observer (unchanged)
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Fetch when page increments (unchanged)
  useEffect(() => {
    if (page > 1) {
      fetchCourses(page);
    }
  }, [page, fetchCourses]);

  return (
    <div className="min-h-screen p-4 text-[black] dark:text-[#ffff] lg:px-24">
      <div className="my-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl md:text-5xl">Courses </h1>

          <p className="mt-2 font-semibold text-gray-500 dark:text-gray-400">
            {totalCourses} Total Courses
          </p>
        </div>

        {/* ⬇️ 4. Add the Filter UI (Dropdown) */}
        {hydrated && (
          <div className="flex items-center gap-2">
            <Select
              variant="bordered"
              labelPlacement="outside-left"
              // Use `selectedKeys` to control the component's value
              selectedKeys={[sortBy]}
              // `onSelectionChange` provides a Set of keys, so we extract the first one
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                if (value) {
                  setSortBy(value as string);
                }
              }}
              classNames={{
                base: "items-center justify-end max-w-fit",
                value: "w-[112px]", // Sets a fixed width for the displayed value
              }}
            >
              <SelectItem key="popular" title="Popular">
                Popular
              </SelectItem>
              <SelectItem key="most-liked" title="Most Liked">
                Most Liked
              </SelectItem>
              <SelectItem key="newest" title="Newest">
                Newest
              </SelectItem>
              <SelectItem key="oldest" title="Oldest">
                Oldest
              </SelectItem>
            </Select>

            <PopoverFilterWrapper title={`Tags (${selectedTags.length})`}>
              {/* ⬇️ 4. Connect CheckboxGroup to state */}
              <CheckboxGroup
                aria-label="Select tags"
                className="gap-1"
                orientation="horizontal"
                value={selectedTags} // Bind value to state
                onValueChange={setSelectedTags} // Update state on change
              >
                {popularTags.map((tag) => (
                  <TagGroupItem key={tag} value={tag}>
                    {tag}
                  </TagGroupItem>
                ))}
              </CheckboxGroup>
            </PopoverFilterWrapper>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {courses.length > 0 &&
            courses.map((course) => (
              <PlaceListItem
                key={`place-${course._id}`}
                id={course._id}
                name={course.course_name}
                href={`/courses/${course._id}`}
                price={course.isPaid ? 99 : null}
                rating={4.5} // You might want to make this dynamic
                ratingCount={150} // You might want to make this dynamic
                description={course.description}
                htmlDescription={course.htmlDescription}
                imageSrc={course.course_image}
                isNew={false}
                tags={course.tags}
                slug={course.slug}
                instructor={course.instructor}
                organization={course.organization}
              />
            ))}

          {/* Skeleton loader (unchanged) */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
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
            ))}
        </div>

        {/* Invisible trigger for infinite scroll (unchanged) */}
        <div ref={observerRef} className="h-10"></div>
      </div>
    </div>
  );
}
