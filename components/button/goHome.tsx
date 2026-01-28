"use client";

import { redirect } from "next/navigation";

const ClientButton = () => {
  return (
    <button
      onClick={() => window.location.replace("/")}
      className="border border-black bg-[#01ffca] px-12 py-4 text-black"
    >
      Go home
    </button>
  );
};

export default ClientButton;
