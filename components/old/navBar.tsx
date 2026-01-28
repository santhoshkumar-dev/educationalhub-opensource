"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { LiaSignOutAltSolid } from "react-icons/lia";
import { MdDashboard } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { Moon, Sun, ShoppingCart } from "lucide-react";
import { ShiftingDropDown } from "../ShifitinngUiHeader";

interface NavBarProps {
  userLogo?: string;
  userFirstName?: string;
  userLastName?: string;
}

interface SearchResult {
  slug: string;
  course_name: string;
}

// Paths where navbar should be hidden
const HIDDEN_PATHS = [
  "/sign-up",
  "/sign-in",
  "/sign-up/sso-callback",
  "/sign-in/sso-callback",
  "/sign-in/continue",
  "/sign-up/continue",
  "/forgot-password",
  "/reset-password",
  "/reset-password/continue",
  "/reset-password/sso-callback",
  "/forgot-password/continue",
  "/forgot-password/sso-callback",
  "/sign-up/verify-email-address",
];

// User Menu Component (reusable for both desktop and mobile)
function UserMenu({
  userLogo,
  showDashboard,
  isMobile = false,
  onClose,
}: {
  userLogo: string;
  showDashboard: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const { user } = useUser();

  const menuItems = [
    {
      icon: <CgProfile className="text-2xl" />,
      label: "My Profile",
      href: `/u/${user?.username}`,
    },
    {
      icon: <FaEdit className="text-2xl" />,
      label: "Edit Profile",
      href: "/my-profile/edit-profile",
    },
    ...(showDashboard
      ? [
          {
            icon: <MdDashboard className="text-2xl" />,
            label: "Dashboard",
            href: "/admin/dashboard",
          },
        ]
      : []),
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-center gap-4">
          <Image
            src={userLogo}
            alt="Profile Logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <p className="font-bold">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center gap-3 border-b border-[#808080ad] pb-1"
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="flex items-center gap-3" onClick={onClose}>
            <LiaSignOutAltSolid className="text-2xl" />
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="flex items-center gap-2 border-b pb-2"
          onClick={onClose}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
      <div className="flex items-center gap-2 border-b pb-2" onClick={onClose}>
        <LiaSignOutAltSolid className="text-2xl" />
        <SignOutButton />
      </div>
    </div>
  );
}

// Search Results Component
function SearchResults({
  results,
  onResultClick,
}: {
  results: SearchResult[];
  onResultClick: () => void;
}) {
  const router = useRouter();

  if (!results.length) return null;

  return (
    <AnimatePresence>
      {results.map((result, index) => (
        <motion.div
          key={result.slug}
          onClick={() => {
            onResultClick();
            router.push(`/courses/${result.slug}`);
          }}
          className="cursor-pointer border-b border-gray-700 p-4 transition-colors hover:bg-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {result.course_name}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export default function NavBar({
  userLogo,
  userFirstName,
  userLastName,
}: NavBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pathName = usePathname();
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

      setIsDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.body.style.backgroundColor = isDark ? "#191919" : "#ffffff";
    }
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (user?.publicMetadata?.role === "admin") {
      setShowDashboard(true);
    }
  }, [user]);

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !searchResultsRef.current?.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setShowUserMenu(false);
    setShowActivityMenu(false);
    setShowMobileSearch(false);
    setSearchResults([]);
  }, [pathName]);

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/courses?search=${query}`);
      const data = await response.json();
      setSearchResults(data.courses || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  }, []);

  // Search submission
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/courses?search=${searchQuery}`);
      setSearchResults([]);
      setShowMobileSearch(false);
    }
  }, [searchQuery, router]);

  // Handle Enter key in search
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  // Toggle theme
  const toggleTheme = useCallback(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const isDark = html.classList.contains("dark");

    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
      body.style.backgroundColor = "#ffffff";
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
      body.style.backgroundColor = "#191919";
    }
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setShowMobileSearch(false);
    setShowActivityMenu((prev) => !prev);
  }, []);

  // Toggle mobile search
  const toggleMobileSearch = useCallback(() => {
    setShowActivityMenu(false);
    setShowMobileSearch((prev) => !prev);
  }, []);

  // Don't render navbar on certain pages
  if (HIDDEN_PATHS.includes(pathName)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50">
      <motion.nav className="flex items-center justify-between border-b border-black bg-customWhite px-4 py-4 pb-3 text-black dark:border-[#333333] dark:bg-[#191919] dark:text-white sm:px-6 lg:px-8 lg:py-6 lg:pb-4 xl:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-5">
          <div className="h-full">
            <Image
              src="/logos/ed-light.png"
              alt="Educational Hub Logo"
              width={48}
              height={48}
              className="cursor-pointer object-contain dark:hidden"
            />
            <Image
              src="/logos/ed-dark.png"
              alt="Educational Hub Logo"
              width={48}
              height={48}
              className="hidden cursor-pointer object-contain dark:block"
            />
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="relative hidden basis-[35%] items-center gap-5 rounded-full border border-black px-4 py-2 dark:border-[#333333] md:flex">
          <input
            type="text"
            placeholder="Search by name, tags, instructor etc"
            className="w-full border-none bg-transparent text-xl focus:outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Search courses"
          />
          <CiSearch
            onClick={handleSearchSubmit}
            className="cursor-pointer text-4xl text-black dark:text-white"
            aria-label="Submit search"
          />

          {searchResults.length > 0 && (
            <div
              ref={searchResultsRef}
              className="absolute left-0 top-full z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-md bg-[#333333] text-white shadow-lg"
            >
              <SearchResults
                results={searchResults}
                onResultClick={() => setSearchResults([])}
              />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden gap-4 md:flex">
          <ShiftingDropDown />
        </div>

        {/* Right Side Actions */}
        <div className="relative flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex md:hidden"
            aria-label="Toggle theme"
          >
            <Sun size={24} className="dark:hidden" />
            <Moon size={24} className="hidden dark:inline" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-black transition-colors hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={24} />
          </Link>

          {/* Mobile Search Icon */}
          <CiSearch
            onClick={toggleMobileSearch}
            className="cursor-pointer text-4xl text-black dark:text-white md:hidden"
            aria-label="Open search"
          />

          {/* Desktop Actions */}
          <div className="hidden items-center gap-6 md:flex">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-black transition-colors hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={24} />
            </Link>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <Sun size={24} className="dark:hidden" />
              <Moon size={24} className="hidden dark:inline" />
            </button>

            {/* User Menu / Login */}
            {userLogo ? (
              <div ref={userMenuRef} className="relative">
                <Image
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  src={userLogo}
                  width={50}
                  height={50}
                  alt="Profile"
                  className="h-12 w-12 cursor-pointer rounded-full object-cover"
                />

                {/* Desktop User Menu Dropdown */}
                <motion.div
                  animate={
                    showUserMenu
                      ? { opacity: 1, y: 0, display: "block" }
                      : {
                          opacity: 0,
                          y: -20,
                          transitionEnd: { display: "none" },
                        }
                  }
                  initial={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute right-0 z-50 mt-2 w-56 rounded-md bg-customWhite p-4 shadow-lg dark:bg-[#333333]"
                >
                  <div
                    id="triangle"
                    className="absolute -top-[37px] right-0 -z-10"
                  />
                  <UserMenu
                    userLogo={userLogo}
                    showDashboard={showDashboard}
                    onClose={() => setShowUserMenu(false)}
                  />
                </motion.div>
              </div>
            ) : (
              <Link
                href="/sign-up"
                className="border border-[#01C5BA] px-3 py-3 transition-colors hover:bg-[#01C5BA] hover:text-white xl:px-6"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle & User Avatar */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Hamburger Menu */}
            <label className="burger" htmlFor="burger">
              <input
                type="checkbox"
                id="burger"
                checked={showActivityMenu}
                onChange={toggleMobileMenu}
                aria-label="Toggle menu"
              />
              <span></span>
              <span></span>
              <span></span>
            </label>

            {/* Mobile User Avatar */}
            {userLogo ? (
              <div ref={userMenuRef} className="relative">
                <Image
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  src={userLogo}
                  width={50}
                  height={50}
                  alt="Profile"
                  className="h-12 w-12 cursor-pointer rounded-full object-cover"
                />

                {/* Mobile User Menu Dropdown */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={
                    showUserMenu
                      ? { opacity: 1, display: "block" }
                      : { opacity: 0, transitionEnd: { display: "none" } }
                  }
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 z-50 w-[210px] translate-y-4 rounded-xl bg-[#333333] p-4"
                >
                  <div
                    id="triangle"
                    className="absolute -top-[10px] right-[18px] -z-10"
                  />
                  <UserMenu
                    userLogo={userLogo}
                    showDashboard={showDashboard}
                    isMobile={true}
                    onClose={() => setShowUserMenu(false)}
                  />
                </motion.div>
              </div>
            ) : (
              <Link
                href="/sign-up"
                className="border border-[#01C5BA] px-3 py-3"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={{ height: 0 }}
        animate={showActivityMenu ? { height: "auto" } : { height: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-40 w-full overflow-hidden md:hidden"
      >
        <div className="flex flex-col bg-customWhite dark:bg-[#191919]">
          {!isSignedIn && (
            <div className="w-full px-3">
              <Link
                href="/sign-up"
                className="my-3 block border border-[#01C5BA] px-3 py-3 text-center text-black dark:text-white"
              >
                Login / Sign Up
              </Link>
            </div>
          )}
          <nav className="flex flex-col text-black dark:text-white">
            <Link
              className="border-b px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
              href="/courses"
            >
              Courses
            </Link>
            <Link
              className="border-b px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
              href="/category"
            >
              Course Categories
            </Link>
            <Link
              className="border-b px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
              href="/resources"
            >
              Resources
            </Link>
            <Link
              className="border-b px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
              href="/contact"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </motion.div>

      {/* Mobile Search Panel */}
      <motion.div
        initial={{ height: 0 }}
        animate={showMobileSearch ? { height: "auto" } : { height: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-40 w-full overflow-hidden bg-customWhite text-black dark:bg-[#191919] dark:text-white md:hidden"
      >
        <div className="flex flex-col p-4">
          <p className="mb-2 font-Monument text-xl">Search Here</p>
          <div className="flex items-center gap-2 border border-black bg-[#333333] p-2 text-white">
            <CiSearch
              onClick={handleSearchSubmit}
              className="cursor-pointer text-4xl"
              aria-label="Submit search"
            />
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              type="text"
              placeholder="Search by name, tags, instructor etc"
              className="w-full border-none bg-transparent outline-none"
              aria-label="Search courses"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2">
              <SearchResults
                results={searchResults}
                onResultClick={() => {
                  setSearchResults([]);
                  setShowMobileSearch(false);
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
