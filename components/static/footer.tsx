/* eslint-disable */

"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <footer className="border-t border-black bg-customWhite dark:border-[#333333] dark:bg-[#191919]">
      <div className="flex flex-col border-b border-black p-6 dark:border-[#333333] md:flex-row md:p-16">
        <div className="flex flex-col text-[black] dark:text-[#ffff] md:basis-[35%]">
          <div className="flex items-center gap-4">
            <div>
              <img
                className="h-full w-12 cursor-pointer object-contain dark:hidden"
                src="/logos/ed-light.png"
                alt="logo"
              />

              <img
                className="hidden h-full w-12 cursor-pointer object-contain dark:block"
                src="/logos/ed-dark.png"
                alt="logo"
              />
            </div>
            <h2 className="text-xl font-bold">Educational Hub</h2>
          </div>

          <p className="mt-4 hidden text-4xl font-bold md:my-6 md:block">
            Learn <br />& Grow ...
          </p>

          <p className="mt-4 block text-2xl font-bold md:my-6 md:hidden">
            Learn & Grow ...
          </p>
        </div>

        <div className="my-4 flex justify-around border-y border-white py-4 text-[black] dark:border-[#808080ad] dark:text-[#ffff] md:my-0 md:basis-[30%] md:justify-evenly md:gap-12 md:border-y-0 md:py-0">
          <div className="flex flex-col gap-5">
            <p className="text-xl font-bold">More</p>

            <a href="/courses" className="text-[black] dark:text-[#ffff]">
              Courses
            </a>
            <a href="resources" className="text-[black] dark:text-[#ffff]">
              Resources
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-xl font-bold">Info</p>

            <a href="/terms" className="text-[black] dark:text-[#ffff]">
              Terms & Conditions
            </a>
            <a href="/legal" className="text-[black] dark:text-[#ffff]">
              Legal & Privacy
            </a>
            <a href="/dmca" className="text-[black] dark:text-[#ffff]">
              DMCA Takedown
            </a>
            <a href="/contact" className="text-[black] dark:text-[#ffff]">
              Contact Us
            </a>
            <a rel="noopener noreferrer" target="_blank" href="/privacy-policy">
              Privacy Policy
            </a>
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="/shipping-delivery"
            >
              Shipping & Delivery Policy
            </a>
          </div>
        </div>

        <div className="flex justify-center text-[black] dark:text-[#ffff] md:basis-[35%]">
          <div className="flex flex-col gap-6">
            <h4>Join Newsletter</h4>

            <p>
              Subscribe our newsletter to get more free <br /> course and
              resources
            </p>

            {/* <div className="relative border-black dark:border-[#333333] border md:w-[80%]">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-4 bg-transparent focus:outline-none text-black dark:placeholder:text-[#ffff] "
              />
              <button className="absolute font-bold text-[#fff] dark:text-black right-0 z-10 w-14 h-14 bg-[#01C5BA] ">
                &gt;
              </button>
            </div> */}

            {/* add comming soon */}

            <p className="text-sm">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* copy right section */}
      <div className="py-12 text-center text-black dark:text-[#fff]">
        <p>Copyright © 2024. All rights reserved</p>
      </div>
    </footer>
  );
}
