"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface MongoUser {
  _id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  clerk_id?: string;
  created_at?: Date;
  profile_image_url?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  linkedin?: string;
  emailNotifications: boolean;
  courseUpdateNotifications: boolean;
  coursePurchaseNotifications: boolean;
  role: "admin" | "user" | "instructor" | "student";
  onboardingComplete: boolean;
  courseProgress: Array<{
    courseSlug: string;
    watchedVideos: Array<{
      chapterIndex: number;
      videoIndex: number;
      watchedAt: Date;
    }>;
  }>;
  enrolledCourses: string[];
  completedCourses: string[];
  institution?: string;
  organization?: string;
}

export const UserContext = createContext<MongoUser | null>(null);

export const UserProvider = ({
  user,
  children,
}: {
  user: MongoUser;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && !user.onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [user, pathname, router]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useMongoUser = (): MongoUser | null => useContext(UserContext);
