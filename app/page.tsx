import { Metadata } from "next";
import { FlipWords } from "@/components/ui/flip-words";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import PopularCourses from "@/components/PopularCourses";
import RecentlyAddedCourses from "@/components/RecentlyAddedCourses";
import Categories from "@/components/landing/Categories";
import StructuredData from "@/components/SEO/StructuredData";
import { DonationModal } from "@/components/DonationModal";
import UpcomingCourses from "@/components/UpcomingCourses";

export const metadata: Metadata = {
  title: "Educational Hub - Learn & Grow | Online Courses & Career Development",
  description:
    "Discover thousands of online courses at Educational Hub. Learn programming, technology, business skills, and more. Start your career growth journey today with expert-led courses and certifications.",
  keywords: [
    "Educational Hub",
    "educationalhub.in",
    "educational hub",
    "educational hub online courses",
    "educational hub career development",
    "educational hub career growth",
    "educational hub career growth courses",
    "educational hub career growth courses online",
    "educational hub career growth courses online india",
    "educational hub career growth courses online india 2025",
    "Online Courses",
    "Learn Online",
    "Career Growth Courses",
    "Programming Courses",
    "Technology Courses",
    "Best Online Learning Platform",
    "Affordable Online Courses",
    "Skill Development",
    "Certification Courses",
    "E-Learning Platform",
  ],
  openGraph: {
    title: "Educational Hub - Learn & Grow | Online Courses",
    description:
      "Discover thousands of online courses at Educational Hub. Learn programming, technology, business skills, and more. Start your career growth journey today.",
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
  twitter: {
    card: "summary_large_image",
    title: "Educational Hub - Learn & Grow | Online Courses",
    description:
      "Discover thousands of online courses at Educational Hub. Learn programming, technology, business skills, and more.",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
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

export default async function Page() {
  const words = ["informative", "engaging", "interactive"];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Educational Hub",
    url: "https://educationalhub.in",
    description:
      "Educational Hub is a comprehensive online learning platform designed to help students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://educationalhub.in/courses?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Educational Hub",
    url: "https://educationalhub.in",
    logo: "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    description:
      "Educational Hub is a comprehensive online learning platform designed to help students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities.",
    sameAs: [
      // Add your social media links here when available
    ],
  };

  return (
    <>
      <StructuredData data={[websiteSchema, organizationSchema]} />
      <DonationModal />
      <section className="bg-customWhite text-black dark:bg-[#191919] dark:text-[#fff]">
        <div className="flex flex-col items-center justify-between border-b border-black text-black dark:border-[#333333] dark:text-[#ffff] md:flex-row">
          <div className="relative flex h-[20rem] w-full items-center justify-center px-4 text-center md:h-[40rem]">
            <TextHoverEffect text="Learn & Grow" />

            <div className="absolute flex h-full w-full items-center justify-center">
              <div className="z-10 text-3xl md:text-6xl">
                <h1 className="sr-only">
                  Educational Hub - Learn & Grow with Online Courses
                </h1>
                <h2 className="text-3xl md:text-6xl">
                  Learn
                  <FlipWords className="text-4xl md:text-8xl" words={words} />
                  <br />
                  with Educational Hub
                </h2>
              </div>
            </div>
          </div>
        </div>

        <Categories />

        <div className="p-4 md:m-5">
          <RecentlyAddedCourses />
        </div>

        <div className="p-4 md:m-5">
          <PopularCourses />
        </div>
      </section>
    </>
  );
}
