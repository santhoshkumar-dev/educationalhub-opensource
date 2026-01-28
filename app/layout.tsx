export const dynamic = "force-dynamic";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import NavBarWrapper from "@/components/static/navBarWrapper";
import Footer from "@/components/static/footer";
import "./globals.css";
import { dark } from "@clerk/themes";
import ThemeInit from "@/components/theme-int";
import { UserProvider } from "./context/UserContext";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/userModel";
import axios from "axios";
import { LoaderProvider } from "@/components/ui/Loader";
import { ToastContainer } from "react-toastify";

import { HeroUIProvider } from "@heroui/react";
import Providers from "./providers";

import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
import { CartProvider } from "./context/CartContext";
import CommunityBanner from "@/components/banners/CommunityBanner";
import FloatingCourseSidebar from "@/components/FloatingCourseSidebar";
import ChappiChatbot from "@/components/chappi/ChappiChatbot";

export const metadata: Metadata = {
  title: "Educational Hub - Learn & Grow",
  description:
    "Educational Hub is a comprehensive online learning platform designed to help students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities. We offer a wide range of industry-relevant courses, coding projects, developer tools, and curated resources to help you master in-demand technologies and stand out in your career. Whether you're looking to enhance your skills in web development, data science, UI/UX design, or soft skills, Educational Hub connects you with college-certified programs, real-world learning tasks, and an AI-powered personalized learning experience — all in one place.",
  keywords: [
    "Educational Hub",
    "Online Courses",
    "Learn Online",
    "Career Growth Courses",
    "Upskill Online",
    "Best Online Learning Platform",
    "Affordable Online Courses",
    "Skill Development Platform",
    "Certification Courses",
    "Short Term Courses",
    "Technology Courses Online",
    "Programming Courses",
    "Learn Programming Online",
    "Learn Coding Online",
    "Self Learning Courses",
    "Online Education Website",
    "E-Learning Platform",
    "Study and Grow Online",
    "Online Classes for Career",
    "Courses for Working Professionals",
    "Courses for Students",
    "Professional Development Courses",
    "Career Advancement Programs",
    "Best Online Classes India",
    "Educational Websites like Udemy",
    "Top Online Learning Sites",
    "Job Oriented Courses",
    "Skill Based Learning",
    "Personal Growth Courses",
    "Remote Learning Courses",
  ],
  openGraph: {
    title:
      "Educational Hub - Learn & Grow | Online Courses & Career Development",
    description:
      "Educational Hub is a comprehensive online learning platform designed to help students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities. We offer a wide range of industry-relevant courses, coding projects, developer tools, and curated resources to help you master in-demand technologies and stand out in your career. Whether you're looking to enhance your skills in web development, data science, UI/UX design, or soft skills, Educational Hub connects you with college-certified programs, real-world learning tasks, and an AI-powered personalized learning experience — all in one place.",
    url: "https://educationalhub.in",
    siteName: "Educational Hub",
    images: [
      {
        url: "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
        width: 1200,
        height: 630,
        alt: "Educational Hub - Online Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://educationalhub.in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  let mongoUser = null;

  if (userId) {
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const fetchUser = await axios.get(`${siteUrl}/api/user/${userId}`);
      mongoUser = fetchUser.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn("MongoDB user not found, proceeding with null user");
        // User not found in MongoDB, but Clerk user exists — might be onboarding
      } else {
        console.error("Unexpected error fetching user:", error);
      }
    }
  }

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <head>
          {/* Ad Sense - (AD_GOOGLE) */}

          {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
            <Script
              id="adsense-script"
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}

          <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: light)"
            content="#F7F7F7"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="#191919"
          />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
  (function() {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (stored === "dark" || (!stored && prefersDark)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  })();`,
            }}
          />
          {/* Google Maps script moved to pages that need it */}
        </head>
        <body className="switchTextColor">
          <Providers>
            <CartProvider>
              <HeroUIProvider>
                <LoaderProvider>
                  <ThemeInit />
                  <UserProvider user={mongoUser}>
                    <NavBarWrapper />
                    <main className="mt-[70px]">
                      <CommunityBanner /> {children}
                    </main>
                    <FloatingCourseSidebar />
                    <ChappiChatbot />
                    <Footer />
                  </UserProvider>
                </LoaderProvider>
              </HeroUIProvider>
            </CartProvider>
          </Providers>

          {/* Toast notifications */}

          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
