"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Avatar,
  Badge,
  Input,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { ShiftingDropDown } from "../ShifitinngUiHeader";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface NavBarProps {
  userLogo?: string;
  userFirstName?: string;
  userLastName?: string;
}

interface SearchResult {
  isPaid: boolean;
  slug: string;
  price: number;
  discountedPrice: number;

  instructors: {
    first_name: string;
    last_name: string;
  }[];
  total_videos: number;
  course_name: string;
  course_image: string;
}

// ============================================================================
// Constants
// ============================================================================

const MOBILE_NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/category", label: "Course Categories" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact Us" },
  { href: "/donate", label: "Donate" },
  { href: "https://tally.so/r/ob9ApX", label: "Course Request" },
];

const LOGO_CONFIG = {
  light: "/logos/ed-light.png",
  dark: "/logos/ed-dark.png",
  size: 40,
  alt: "Educational Hub Logo",
};

const THEME_COLORS = {
  dark: "#191919",
  light: "#ffffff",
};

// ============================================================================
// Helper Functions
// ============================================================================

const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return false;
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return savedTheme === "dark" || (!savedTheme && prefersDark);
};

const applyTheme = (isDark: boolean): void => {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
  document.body.style.backgroundColor = isDark
    ? THEME_COLORS.dark
    : THEME_COLORS.light;
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

const isAdmin = (user: any): boolean => {
  return user?.publicMetadata?.role === "admin";
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Search Results Component
 */
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
    <div className="mt-4 w-full">
      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-divider bg-content1">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={result.slug}
              onClick={() => {
                onResultClick();
                router.push(`/courses/${result.slug}`);
              }}
              className="flex cursor-pointer items-start gap-4 border-b border-divider px-4 py-3 transition-colors last:border-b-0 hover:bg-content2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {/* Image */}
              <Image
                height={100}
                width={100}
                src={result.course_image}
                alt={result.course_name}
                className="h-14 w-14 flex-shrink-0 rounded-md object-contain"
              />

              {/* Text Content */}
              <div className="flex-grow">
                {/* Course Name */}
                <p className="text-sm font-medium">{result.course_name}</p>

                {/* Instructor Name */}
                {result.instructors && result.instructors.length > 0 && (
                  <p className="text-xs text-default-600">
                    By {result.instructors[0].first_name}{" "}
                    {result.instructors[0].last_name}
                  </p>
                )}

                {/* Stats (Videos) */}
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-default-500">
                    {result.total_videos} videos
                  </span>
                </div>
              </div>

              {/* NEW: Pricing Logic (Aligned to the right) */}
              {/* We use flex-shrink-0 to stop it from shrinking and text-right to align */}
              <div className="flex-shrink-0 text-right">
                {!result.isPaid ? (
                  // 1. FREE COURSE
                  <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800">
                    Free
                  </span>
                ) : result.discountedPrice &&
                  result.discountedPrice < result.price ? (
                  // 2. ON SALE
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-semibold">
                      ₹{result.discountedPrice}
                    </p>
                    <p className="text-xs text-default-500 line-through">
                      ₹{result.price}
                    </p>
                  </div>
                ) : result.price > 0 ? (
                  // 3. REGULAR PRICE
                  <p className="text-sm font-semibold">₹{result.price}</p>
                ) : (
                  // 4. FALLBACK (if isPaid=true but no price listed)
                  <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800">
                    Paid
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Search Modal Component
 */
function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const router = useRouter();

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

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/courses?search=${searchQuery}`);
      setSearchResults([]);
      onClose();
    }
  }, [searchQuery, router, onClose]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  const handleResultClick = useCallback(() => {
    setSearchResults([]);
    onClose();
  }, [onClose]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="top"
      classNames={{
        base: "mt-20",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4">
              <p className="text-lg font-semibold">Search Courses</p>
            </ModalHeader>
            <ModalBody className="py-6">
              <Input
                style={{
                  outline: "none",
                }}
                autoFocus
                placeholder="Search by name, tags, instructor etc"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                startContent={
                  <Icon
                    className="text-default-400"
                    icon="solar:magnifer-linear"
                    width={20}
                  />
                }
                endContent={
                  searchQuery && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <Icon icon="solar:close-circle-linear" width={18} />
                    </Button>
                  )
                }
                classNames={{
                  input: "text-base",
                  inputWrapper: "h-12 shadow-sm",
                }}
                size="lg"
              />

              {searchResults.length > 0 && (
                <SearchResults
                  results={searchResults}
                  onResultClick={handleResultClick}
                />
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                  <Icon
                    icon="solar:file-search-linear"
                    width={48}
                    className="mb-3 text-default-300"
                  />
                  <p className="text-sm text-default-500">
                    No courses found matching &apos;{searchQuery}&apos;
                  </p>
                </div>
              )}

              {!searchQuery && (
                <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                  <Icon
                    icon="solar:magnifer-linear"
                    width={48}
                    className="mb-3 text-default-300"
                  />
                  <p className="text-sm text-default-500">
                    Start typing to search for courses
                  </p>
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/**
 * Logo Component
 */
function LogoBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src={LOGO_CONFIG.light}
        alt={LOGO_CONFIG.alt}
        width={LOGO_CONFIG.size}
        height={LOGO_CONFIG.size}
        className="cursor-pointer object-contain dark:hidden"
      />
      <Image
        src={LOGO_CONFIG.dark}
        alt={LOGO_CONFIG.alt}
        width={LOGO_CONFIG.size}
        height={LOGO_CONFIG.size}
        className="hidden cursor-pointer object-contain dark:block"
      />
    </Link>
  );
}

// ============================================================================
// Main NavBar Component
// ============================================================================

export default function NavBar({
  userLogo,
  userFirstName,
  userLastName,
}: NavBarProps) {
  // State Management
  const [showDashboard, setShowDashboard] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hooks
  const pathName = usePathname();
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // ============================================================================
  // Effects
  // ============================================================================

  // Initialize theme
  useEffect(() => {
    const isDark = getInitialTheme();
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // Check admin status
  useEffect(() => {
    if (isAdmin(user)) {
      setShowDashboard(true);
    }
  }, [user]);

  // Reset state on navigation
  useEffect(() => {
    setIsSearchModalOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathName]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const toggleTheme = useCallback(() => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    applyTheme(newIsDarkMode);
  }, [isDarkMode]);

  const handleOpenSearchModal = useCallback(() => {
    setIsSearchModalOpen(true);
  }, []);

  const handleCloseSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);

  // ============================================================================
  // Render Guards
  // ============================================================================

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <Navbar
        classNames={{
          base: "fixed top-0 left-0 lg:!backdrop-filter-none border-b border-divider dark:!bg-customBlack !bg-customWhite",
          wrapper: "px-4 sm:px-6",
          item: "data-[active=true]:text-primary",
        }}
        height="70px"
        isMenuOpen={isMobileMenuOpen}
        onMenuOpenChange={setIsMobileMenuOpen}
      >
        {/* Left Section - Logo and Menu Toggle */}
        <NavbarBrand>
          <NavbarMenuToggle className="mr-2 h-6 sm:hidden" />
          <LogoBrand />
        </NavbarBrand>

        {/* Center Section - Desktop Navigation with Pill Background */}
        <NavbarContent
          className="ml-4 hidden h-12 w-full max-w-fit gap-0 rounded-full bg-content2 px-2 dark:bg-content1 sm:flex"
          justify="start"
        >
          <ShiftingDropDown />
        </NavbarContent>

        {/* Right Section - Actions */}
        <NavbarContent
          className="ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 lg:bg-content2 lg:px-1 lg:dark:bg-content1"
          justify="end"
        >
          {/* Search Button - Available on all screen sizes */}
          <NavbarItem className="flex">
            <Button
              isIconOnly
              radius="full"
              variant="light"
              onPress={handleOpenSearchModal}
              aria-label="Search"
            >
              <Icon
                className="text-default-500"
                icon="solar:magnifer-linear"
                width={22}
              />
            </Button>
          </NavbarItem>

          {/* Theme Toggle */}
          <NavbarItem className="sm:flex">
            <Button
              isIconOnly
              radius="full"
              variant="light"
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <Icon
                  className="text-default-500"
                  icon="solar:sun-linear"
                  width={24}
                />
              ) : (
                <Icon
                  className="text-default-500"
                  icon="solar:moon-linear"
                  width={24}
                />
              )}
            </Button>
          </NavbarItem>

          {/* Cart */}
          <NavbarItem className="sm:flex">
            <Button
              isIconOnly
              as={Link}
              href="/cart"
              radius="full"
              variant="light"
              aria-label="Shopping Cart"
            >
              <Icon
                className="text-default-500"
                icon="solar:cart-large-2-linear"
                width={22}
              />
            </Button>
          </NavbarItem>

          {/* User Menu or Login Button */}
          <NavbarItem className="flex px-2">
            {userLogo && isSignedIn ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <button
                    type="button"
                    title="avatar"
                    className="mt-1 h-8 w-8 outline-none transition-transform"
                  >
                    <Badge
                      className="border-transparent"
                      color="success"
                      content=""
                      placement="bottom-right"
                      shape="circle"
                      size="sm"
                    >
                      <Avatar size="sm" src={userLogo} />
                    </Badge>
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2"
                    textValue="Profile"
                  >
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </DropdownItem>
                  <DropdownItem
                    key="my-profile"
                    as={Link}
                    href={`/u/${user?.username}`}
                    startContent={<Icon icon="solar:user-outline" width={20} />}
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem
                    key="edit-profile"
                    as={Link}
                    href="/my-profile/edit-profile"
                    startContent={<Icon icon="solar:pen-linear" width={20} />}
                  >
                    Edit Profile
                  </DropdownItem>
                  <DropdownItem
                    key="liked-courses"
                    as={Link}
                    href={`/u/${user?.username}/liked-courses`}
                    startContent={<Icon icon="solar:heart-linear" width={20} />}
                  >
                    Liked Courses
                  </DropdownItem>
                  {showDashboard ? (
                    <DropdownItem
                      key="dashboard"
                      as={Link}
                      href="/admin/dashboard"
                      startContent={
                        <Icon icon="solar:widget-linear" width={20} />
                      }
                    >
                      Dashboard
                    </DropdownItem>
                  ) : null}
                  <DropdownItem
                    key="logout"
                    color="danger"
                    className="text-danger"
                    startContent={
                      <Icon icon="solar:logout-2-linear" width={20} />
                    }
                  >
                    <SignOutButton />
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                as={Link}
                href="/sign-up"
                color="primary"
                variant="flat"
                size="sm"
                className="font-medium"
              >
                Login / Sign Up
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="pt-6">
          {!isSignedIn && (
            <NavbarMenuItem>
              <Button
                as={Link}
                href="/sign-up"
                color="primary"
                variant="flat"
                className="w-full"
                size="lg"
              >
                Login / Sign Up
              </Button>
            </NavbarMenuItem>
          )}
          {MOBILE_NAV_LINKS.map((item, index) => (
            <NavbarMenuItem
              key={`${item.href}-${index}`}
              isActive={pathName === item.href}
            >
              <Link
                className={`w-full ${pathName === item.href ? "text-primary" : "text-foreground"}`}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
      />
    </>
  );
}
