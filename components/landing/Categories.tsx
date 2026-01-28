"use client";
import { Image } from "@heroui/react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";

// Helper function to create slug from title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\//g, "-")
    .replace(/&/g, "and");
};

const CategoriesData = [
  {
    img: "/features/webp/web-development.webp",
    title: "Web Development",
  },
  {
    img: "/features/webp/python.webp",
    title: "Python Programming",
  },
  {
    img: "/features/webp/artificial-intelligence.webp",
    title: "Artificial Intelligence",
  },
  {
    img: "/features/webp/data-science.webp",
    title: "Data Science",
  },
  {
    img: "/features/webp/mobile-app.webp",
    title: "App Development",
  },
  {
    img: "/features/webp/video-editing.webp",
    title: "Video Editing",
    href: "#",
  },
  {
    img: "/features/webp/fitness-nutrition.webp",
    title: "Fitness & Nutrition",
    href: "#",
  },
];

function Categories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section>
      <div className="rounded-t-2xl bg-primaryPurple p-4 py-6 text-white md:p-9">
        <div className="flex items-center pb-4 md:py-8">
          <h1 className="text-xl md:min-w-[40%] md:text-5xl">
            Course Categories
          </h1>

          <div className="hidden h-0.5 flex-1 bg-white md:block"></div>

          <div className="ml-7 flex items-center gap-4">
            <button
              title="left"
              onClick={() => scroll("left")}
              className="cursor-pointer transition-transform hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              title="right"
              onClick={() => scroll("right")}
              className="cursor-pointer transition-transform hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="mb-7 flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide"
        >
          {CategoriesData.map((item, index) => (
            <Link
              key={`${item.title}-${index}`}
              href={`/category/${createSlug(item.title)}`}
              className="group space-y-4"
            >
              <div className="relative w-full min-w-[280px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl md:w-96 md:min-w-[384px]">
                <Image
                  alt={item.title}
                  src={item.img}
                  className="aspect-square !rounded-xl object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-2 text-lg font-semibold text-white">
                    Explore More
                    <ArrowRight size={20} />
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold transition-colors">
                  {item.title}
                </p>
                <ArrowRight
                  size={24}
                  className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Explore All Categories Button */}
        <div className="flex justify-center pt-4">
          <Link
            href="/category"
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primaryPurple transition-all hover:shadow-lg md:w-auto md:justify-end"
          >
            Explore All Categories
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Categories;
