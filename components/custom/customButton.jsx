"use client";
import React from "react";

function CustomButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-32 bg-primaryPurple px-4 py-2 text-center font-semibold text-black"
    >
      {children}
    </button>
  );
}

export default CustomButton;
