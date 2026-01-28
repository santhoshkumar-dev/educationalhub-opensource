"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Image, ScrollShadow, Skeleton, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Course = {
  _id?: string;
  id?: string;
  course_name: string;
  courseName?: string;
  course_image?: string;
  image?: string;
  slug?: string;
  organization?: {
    name: string;
    logo?: string;
    _id: string;
  };
  description?: string;
  date?: string;
  votes?: number;
  platform?: string;
};

export default function FloatingCourseSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "popular" | "recent" | "upcoming" | null
  >(null);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveTab(null);
  }, [pathname]);

  const fetchCourses = async (type: "popular" | "recent" | "upcoming") => {
    setLoading(true);
    try {
      let endpoint = "";
      if (type === "popular") endpoint = "/api/courses/popular";
      else if (type === "recent") endpoint = "/api/courses/recent";
      else endpoint = "/api/upcoming-courses";

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (type === "popular") setPopularCourses(data.courses || []);
      else if (type === "recent") setRecentCourses(data.courses || []);
      else setUpcomingCourses(data.courses || []);
    } catch (error) {
      console.error(`Error fetching ${type} courses:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (tab: "popular" | "recent" | "upcoming") => {
    if (activeTab === tab && isOpen) {
      setIsOpen(false);
      setActiveTab(null);
    } else {
      setActiveTab(tab);
      setIsOpen(true);
      if (tab === "popular" && popularCourses.length === 0)
        fetchCourses("popular");
      if (tab === "recent" && recentCourses.length === 0)
        fetchCourses("recent");
      if (tab === "upcoming" && upcomingCourses.length === 0)
        fetchCourses("upcoming");
    }
  };

  const coursesToDisplay =
    activeTab === "popular"
      ? popularCourses
      : activeTab === "recent"
        ? recentCourses
        : upcomingCourses;
  const title =
    activeTab === "popular"
      ? "Popular Courses"
      : activeTab === "recent"
        ? "Recently Added"
        : "Upcoming Courses";

  return (
    <>
      {/* Floating Icons */}
      <div className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 rounded-l-xl border border-r-0 border-[#333333] bg-customWhite/80 p-2 shadow-lg backdrop-blur-md dark:bg-[#1e1e1e]/80">
        <Tooltip content="Popular Courses" placement="left">
          <Button
            isIconOnly
            variant={activeTab === "popular" && isOpen ? "solid" : "light"}
            className={`h-10 w-10 min-w-10 ${
              activeTab === "popular" && isOpen
                ? "bg-[#01ffca] text-black"
                : "text-default-500"
            }`}
            onPress={() => handleToggle("popular")}
          >
            <Icon icon="solar:fire-bold" width={24} />
          </Button>
        </Tooltip>

        <Tooltip content="Recently Added" placement="left">
          <Button
            isIconOnly
            variant={activeTab === "recent" && isOpen ? "solid" : "light"}
            className={`h-10 w-10 min-w-10 ${
              activeTab === "recent" && isOpen
                ? "bg-[#01ffca] text-black"
                : "text-default-500"
            }`}
            onPress={() => handleToggle("recent")}
          >
            <Icon icon="solar:clock-circle-bold" width={24} />
          </Button>
        </Tooltip>

        <Tooltip content="Upcoming Courses" placement="left">
          <Button
            isIconOnly
            variant={activeTab === "upcoming" && isOpen ? "solid" : "light"}
            className={`h-10 w-10 min-w-10 ${
              activeTab === "upcoming" && isOpen
                ? "bg-[#01ffca] text-black"
                : "text-default-500"
            }`}
            onPress={() => handleToggle("upcoming")}
          >
            <Icon icon="solar:calendar-add-bold" width={24} />
          </Button>
        </Tooltip>
      </div>

      {/* Sidebar Overlay (optional, clicking outside closes) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-80 border-l border-[#333333] bg-customWhite shadow-2xl dark:bg-[#1e1e1e] dark:text-white"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#333333] p-4">
                <h3 className="text-lg font-bold">{title}</h3>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setIsOpen(false)}
                >
                  <Icon icon="solar:close-circle-bold" width={24} />
                </Button>
              </div>

              <ScrollShadow className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-14 w-20 rounded-md" />
                        <div className="flex flex-1 flex-col gap-2">
                          <Skeleton className="h-3 w-3/4 rounded-lg" />
                          <Skeleton className="h-3 w-1/2 rounded-lg" />
                        </div>
                      </div>
                    ))
                  ) : coursesToDisplay.length > 0 ? (
                    coursesToDisplay.map((course) => (
                      <Link
                        key={course._id || course.id}
                        href={course.slug ? `/courses/${course.slug}` : "#"}
                        className={`group flex gap-3 rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${!course.slug ? "cursor-default" : ""}`}
                        onClick={() => course.slug && setIsOpen(false)}
                      >
                        {activeTab !== "upcoming" && (
                          <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border border-[#333333]">
                            <Image
                              src={
                                course.course_image ||
                                course.image ||
                                "/placeholder.png"
                              }
                              alt={course.course_name || course.courseName}
                              classNames={{
                                wrapper: "h-full w-full",
                                img: "object-cover h-full w-full",
                              }}
                            />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-col justify-center gap-0.5">
                          <h4 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-[#01ffca]">
                            {course.course_name || course.courseName}
                          </h4>
                          {course.organization ? (
                            <p className="line-clamp-1 text-xs text-default-500">
                              {course.organization.name}
                            </p>
                          ) : activeTab === "upcoming" ? (
                            <div className="mt-1 flex items-center gap-2">
                              {course.platform && (
                                <span className="rounded bg-default-100 px-1 text-[10px] text-default-500">
                                  {course.platform}
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-[#01ffca]">
                                <Icon icon="solar:fire-bold" width={12} />
                                <span>{course.votes || 0}</span>
                              </div>
                            </div>
                          ) : course.date ? (
                            <p className="text-[10px] font-bold text-[#01ffca]">
                              {new Date(course.date).toLocaleDateString()}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center text-default-500">
                      No courses found.
                    </div>
                  )}
                </div>
              </ScrollShadow>

              <div className="border-t border-[#333333] p-4">
                {activeTab !== "upcoming" && (
                  <Button
                    as={Link}
                    href={`/courses?sort=${activeTab === "popular" ? "popular" : "newest"}`}
                    fullWidth
                    className="bg-[#01ffca] font-medium text-black"
                    variant="solid"
                    onPress={() => setIsOpen(false)}
                  >
                    View All
                  </Button>
                )}
                {activeTab === "upcoming" && (
                  <Button
                    as={Link}
                    href="/upcoming"
                    fullWidth
                    className="bg-[#01ffca] font-medium text-black"
                    variant="solid"
                    onPress={() => setIsOpen(false)}
                  >
                    Vote for More
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
