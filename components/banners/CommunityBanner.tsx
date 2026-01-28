"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

type BannerButtonColor =
  | "success"
  | "default"
  | "primary"
  | "secondary"
  | "warning"
  | "danger";

type BannerButton = {
  label: string;
  url: string;
  color: BannerButtonColor;
};

type BannerMessage = {
  id: string;
  text: string;
  buttons: BannerButton[];
};

const BANNER_MESSAGES: BannerMessage[] = [];

const CommunityBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [banners, setBanners] = useState<BannerMessage[]>(BANNER_MESSAGES);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Check if banner was dismissed today
        const lastDismissed = localStorage.getItem("bannerLastDismissed");
        const dismissedDate = lastDismissed ? new Date(lastDismissed) : null;
        const today = new Date();

        if (
          dismissedDate &&
          dismissedDate.toDateString() === today.toDateString()
        ) {
          setLoading(false);
          return;
        }

        // Fetch banners from API
        const response = await fetch("/api/community-banner");
        const data = await response.json();

        if (data.success && data.banners.length > 0) {
          setBanners(data.banners);
          setIsVisible(true);

          // Get last viewed index or start at random
          const lastIndex = localStorage.getItem("lastBannerIndex");
          const startIndex = lastIndex
            ? (parseInt(lastIndex) + 1) % data.banners.length
            : Math.floor(Math.random() * data.banners.length);

          setCurrentIndex(startIndex);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        setIsVisible(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (!isVisible || !autoRotate || banners.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, autoRotate, banners.length]);

  const handleNext = () => {
    setAutoRotate(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setAutoRotate(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleDotClick = (index: number) => {
    setAutoRotate(false);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const swipeThreshold = 50;

    if (info.offset.x > swipeThreshold) {
      // Swiped right - go to previous
      handlePrev();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left - go to next
      handleNext();
    }
  };

  // Single return check
  if (loading || !isVisible || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative flex w-full items-center justify-center border-b px-4 py-3">
      {/* Previous Button */}
      {banners.length > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 md:block"
          aria-label="Previous banner"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Banner Content Container with proper centering */}
      <div className="relative mx-auto flex w-full max-w-4xl items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag={banners.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex w-full cursor-grab flex-col items-center justify-center gap-2 active:cursor-grabbing sm:flex-row sm:gap-4 md:cursor-grab"
          >
            <p className="text-center text-xs sm:text-sm">
              {currentBanner.text}
            </p>

            <div className="flex gap-2">
              {currentBanner.buttons.map((button, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    window.open(
                      button.url,
                      button.url.startsWith("http") ? "_blank" : "_self",
                    );
                  }}
                  size="sm"
                  color={button.color}
                  className="pointer-events-auto"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      {banners.length > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 md:block"
          aria-label="Next banner"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default CommunityBanner;
