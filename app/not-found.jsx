"use client";
import React from "react";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center md:flex-row">
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="mt-4 text-7xl font-bold italic md:mt-0 xl:text-9xl">
          4<span className="text-[#01ffca]">0</span>4
        </p>
        <motion.div
          initial={{ borderBottomWidth: "0px" }}
          animate={{ borderBottomWidth: "1px" }} // Adjust thickness as needed
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{
            borderBottom: "1px solid white", // Set the border color and width here
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "1px", // Match borderBottomWidth
              backgroundColor: "white", // Match border color
              width: "0%",
            }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <p className="text-4xl">Oops!</p>
        </motion.div>
        <p>
          We couldn&apos;t find the page <br />
          you were looking for...
        </p>

        <button
          onClick={() => window.location.replace("/")}
          className="border border-black bg-[#01ffca] px-12 py-4 text-black"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
