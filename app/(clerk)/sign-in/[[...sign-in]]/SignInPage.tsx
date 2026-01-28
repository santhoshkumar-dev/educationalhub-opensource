// @ts-nocheck
"use client";
import { SignIn } from "@clerk/nextjs";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import Link from "next/link";
import { CiSearch } from "react-icons/ci";
import { useState, useRef, useEffect } from "react";

export default function SignInPage() {
  const user = null;
  const [searchQuery, setSearchQuery] = useState("");
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false; // avoid SSR mismatch; corrected on mount
    return localStorage.getItem("theme") === "light" ? false : true;
  });

  const searchButton = () => {
    router.push(`/courses?search=${searchQuery}`);
  };

  console.log("Dark mode:", isDarkMode);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      // Replace with your search API or MongoDB query
      const response = await fetch(`/api/courses?search=${query}`);
      const results = await response.json();
      setSearchResults(results.courses);
    } catch (error) {
      setSearchResults([]);
    }
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ height: 0 }}
        animate={showMobileSearch ? { height: "auto" } : { height: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-[100000000] w-full overflow-hidden bg-[#333333] md:hidden"
      >
        <div className="flex flex-col p-4">
          <p className="font-Monument text-xl text-white">Search Here</p>
          <div className="mt-2 flex items-center gap-2 bg-customWhite p-2">
            <CiSearch
              onClick={searchButton}
              className="cursor-pointer text-4xl text-black"
            />
            <input
              title="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              type="text"
              className="w-full border-none text-black outline-none"
            />
          </div>
          {searchResults && (
            <div className="mt-2">
              {searchResults.map((result, index) => (
                <motion.div
                  key={index}
                  className="border-b border-gray-700 p-4 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={`/courses/${result.slug}`}>
                    {result.course_name}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative my-14 flex flex-col items-center justify-center gap-4 px-4"
      >
        <div className="text-center text-3xl font-bold dark:text-white md:text-7xl">
          Welcome back!
        </div>
        <div className="py-4 text-base font-extralight dark:text-neutral-200 md:text-4xl">
          Continue your learning journey.
        </div>
        <SignIn />
      </motion.div>
    </AuroraBackground>
  );
}
