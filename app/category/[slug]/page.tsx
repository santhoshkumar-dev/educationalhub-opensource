"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import axios from "axios";
import { useParams } from "next/navigation";
import PlaceListItem from "@/components/hero-ui/place-list-item";
import { Skeleton, Select, SelectItem, CheckboxGroup } from "@heroui/react";
import PopoverFilterWrapper from "@/components/hero-ui/popover-wrapper";
import TagGroupItem from "@/components/hero-ui/tag-group-item";

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

type Category = {
  _id: string;
  img: string;
  title: string;
  slug: string;
  description: string;
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`sortBy-${slug}`) || "popular";
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
        const response = await axios.get(`/api/category/${slug}`, {
          params: {
            page: pageNum,
            limit: 8,
            sort: sortBy,
            ...(selectedTags.length > 0 && { tags: selectedTags.join(",") }),
          },
        });

        const newCourses = response.data.courses || [];

        if (replace) {
          setCourses(newCourses);
          setCategory(response.data.category);
          setTotalCourses(response.data.total);
        } else {
          setCourses((prev) => [...prev, ...newCourses]);
        }

        setHasMore(pageNum < response.data.totalPages);
      } catch (error) {
        console.error("Error fetching courses:", error);
        if (replace) {
          setCourses([]);
          setCategory(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [slug, sortBy, selectedTags],
  );

  useEffect(() => {
    setHydrated(true);
    const savedSort = localStorage.getItem(`sortBy-${slug}`);
    if (savedSort) {
      setSortBy(savedSort);
    }
  }, [slug]);

  useEffect(() => {
    if (hydrated && slug) {
      localStorage.setItem(`sortBy-${slug}`, sortBy);
    }
  }, [sortBy, hydrated, slug]);

  useEffect(() => {
    if (slug && hydrated) {
      setPage(1);
      fetchCourses(1, true);
    }
  }, [slug, sortBy, selectedTags, hydrated, fetchCourses]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchCourses(page, false);
    }
  }, [page, fetchCourses]);

  if (loading && page === 1) {
    return <CategoryPageSkeleton />;
  }

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-500">Category not found</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen">
      {/* Parallax Hero Section */}
      <ParallaxHero category={category} totalCourses={totalCourses} />

      {/* Courses Grid Section */}
      <div className="px-4 pb-24 lg:px-24">
        {/* Header with Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-1 text-2xl font-bold md:text-3xl">
              Browse Courses
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 md:text-base">
              Discover {totalCourses} courses in {category.title}
            </p>
          </div>

          {/* Filters */}
          {hydrated && (
            <div className="flex flex-wrap items-center gap-2">
              <Select
                variant="bordered"
                label="Sort by"
                labelPlacement="outside-left"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];
                  if (value) {
                    setSortBy(value as string);
                  }
                }}
                classNames={{
                  base: "items-center max-w-fit",
                  mainWrapper: "w-[130px]",
                }}
              >
                <SelectItem key="popular">Popular</SelectItem>
                <SelectItem key="newest">Newest</SelectItem>
                <SelectItem key="oldest">Oldest</SelectItem>
              </Select>

              <PopoverFilterWrapper
                title={`Tags ${selectedTags.length > 0 ? `(${selectedTags.length})` : ""}`}
              >
                <CheckboxGroup
                  aria-label="Select tags"
                  className="gap-1"
                  orientation="horizontal"
                  value={selectedTags}
                  onValueChange={setSelectedTags}
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

        {/* Courses Grid */}
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <PlaceListItem
              key={course._id}
              id={course._id}
              name={course.course_name}
              href={`/courses/${course._id}`}
              price={course.isPaid ? 99 : null}
              rating={4.5}
              ratingCount={150}
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

          {/* Loading Skeletons */}
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

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-center">
              <div className="mb-4 text-6xl">📚</div>
              <h3 className="mb-2 text-xl font-semibold">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or check back later
              </p>
            </div>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={observerRef} className="h-20"></div>
      </div>
    </section>
  );
}

// Parallax Hero Component with Scroll Effects
const ParallaxHero = ({
  category,
  totalCourses,
}: {
  category: Category;
  totalCourses: number;
}) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  // Image transforms
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.8, 0.3],
  );

  // Text transforms
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  // Overlay transforms
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 0.9]);

  return (
    <div
      ref={targetRef}
      className="relative mb-12 h-[60vh] min-h-[500px] overflow-hidden md:h-[70vh]"
    >
      {/* Background Image with Parallax */}
      <motion.div
        style={{
          scale: imageScale,
          opacity: imageOpacity,
        }}
        className="absolute inset-0 h-full w-full"
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${category.img})`,
          }}
        />
      </motion.div>

      {/* Dynamic Gradient Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />

      {/* Parallax Content */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
        }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white lg:px-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 text-2xl font-bold leading-tight md:text-4xl lg:text-5xl"
          >
            {category.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-200 md:text-lg"
          >
            {category.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <span className="rounded-full bg-white/20 px-6 py-3 text-sm font-medium backdrop-blur-md md:text-base">
              {totalCourses} {totalCourses === 1 ? "Course" : "Courses"}{" "}
              Available
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg
          className="h-12 w-full md:h-16"
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 48h1440V0c-240 48-480 48-720 24C480 0 240 0 0 24v24z"
            className="fill-customWhite dark:fill-customBlack"
          />
        </svg>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        style={{ opacity: textOpacity }}
        className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-wider text-white/80">
            Scroll
          </span>
          <svg
            className="h-6 w-6 text-white/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Improved Skeleton
const CategoryPageSkeleton = () => (
  <div className="min-h-screen">
    {/* Hero Skeleton */}
    <div className="mb-12">
      <Skeleton className="h-[60vh] min-h-[500px] w-full md:h-[70vh]" />
    </div>

    {/* Content Skeleton */}
    <div className="px-4 pb-24 lg:px-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
