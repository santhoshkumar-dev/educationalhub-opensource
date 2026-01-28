"use client";
import { createContext, useContext } from "react";

type Organization = { name: string; logo?: string; htmlDescription?: string };
type Course = {
  _id: string; // from /api/courses/popular
  course_name: string;
  course_image?: string; // optional in case some are missing
  slug: string;
  rating?: number;
  htmlDescription?: string;
  description?: string; // optional in case some are missing
  tags?: string[]; // optional in case some are missing
  organization?: {
    name: string;
    htmlDescription?: string;
    logo?: string;
    _id: string;
  };
};

type OrgContextValue = { organization: Organization; courses: Course[] };

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  value,
  children,
}: {
  value: OrgContextValue;
  children: React.ReactNode;
}) {
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider>");
  return ctx;
}
