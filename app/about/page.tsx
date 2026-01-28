import { Metadata } from "next";
import StructuredData from "@/components/SEO/StructuredData";
import { BookOpen, Users, Award, Target, Zap, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Educational Hub | Learn & Grow with Online Courses",
  description:
    "Learn about Educational Hub - a comprehensive online learning platform helping students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities. Discover our mission, vision, and commitment to quality education.",
  keywords: [
    "About Educational Hub",
    "Educational Hub mission",
    "Online learning platform",
    "Career development courses",
    "Skill development",
    "Professional education",
    "E-learning platform India",
  ],
  openGraph: {
    title: "About Us - Educational Hub | Online Learning Platform",
    description:
      "Learn about Educational Hub - a comprehensive online learning platform helping students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities.",
    url: "https://educationalhub.in/about",
    siteName: "Educational Hub",
    images: [
      {
        url: "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
        width: 1200,
        height: 630,
        alt: "About Educational Hub - Online Learning Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - Educational Hub",
    description:
      "Learn about Educational Hub - a comprehensive online learning platform helping students, professionals, and lifelong learners.",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
  alternates: {
    canonical: "https://educationalhub.in/about",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Educational Hub",
  description:
    "Educational Hub is a comprehensive online learning platform designed to help students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities.",
  url: "https://educationalhub.in/about",
  mainEntity: {
    "@type": "Organization",
    name: "Educational Hub",
    url: "https://educationalhub.in",
    logo: "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    description:
      "Educational Hub is a comprehensive online learning platform designed to help students, professionals, and lifelong learners gain practical skills, certifications, and career growth opportunities.",
  },
};

export default function AboutPage() {
  return (
    <>
      <StructuredData data={aboutPageSchema} />
      <div className="min-h-screen bg-customWhite text-black dark:bg-[#191919] dark:text-[#fff]">
        <div className="container mx-auto px-4 py-12 md:px-8 lg:px-16">
          {/* Hero Section */}
          {/* <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              About Educational Hub
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
              Empowering learners worldwide with accessible, high-quality online
              education and career development opportunities.
            </p>
          </div> */}

          {/* Mission & Vision */}
          {/* <div className="mb-16 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-[#333333] dark:bg-[#1a1a1a]">
              <div className="mb-4 flex items-center gap-3">
                <Target className="h-8 w-8 text-primaryPurple" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                To democratize quality education by providing accessible,
                affordable, and industry-relevant online courses that empower
                individuals to achieve their career goals and personal growth
                aspirations. We believe that everyone deserves access to
                world-class education, regardless of their location or
                background.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-[#333333] dark:bg-[#1a1a1a]">
              <div className="mb-4 flex items-center gap-3">
                <Zap className="h-8 w-8 text-primaryPurple" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                To become the leading online learning platform that transforms
                lives through education. We envision a world where anyone,
                anywhere can access the skills and knowledge needed to succeed
                in their chosen field, fostering a global community of
                continuous learners and innovators.
              </p>
            </div>
          </div> */}

          {/* What We Offer */}
          {/* <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
              What We Offer
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <BookOpen className="mb-4 h-10 w-10 text-primaryPurple" />
                <h3 className="mb-2 text-xl font-semibold">
                  Comprehensive Courses
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Thousands of courses covering programming, technology,
                  business, design, and more. Learn from industry experts and
                  gain practical, job-ready skills.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <Award className="mb-4 h-10 w-10 text-primaryPurple" />
                <h3 className="mb-2 text-xl font-semibold">
                  Certifications & Credentials
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Earn recognized certifications and credentials that validate
                  your skills and enhance your professional profile. Stand out
                  to employers with industry-relevant qualifications.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <Users className="mb-4 h-10 w-10 text-primaryPurple" />
                <h3 className="mb-2 text-xl font-semibold">
                  Expert Instructors
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn from experienced professionals and industry leaders who
                  bring real-world expertise and practical insights to every
                  course.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <Globe className="mb-4 h-10 w-10 text-primaryPurple" />
                <h3 className="mb-2 text-xl font-semibold">
                  Flexible Learning
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Study at your own pace, anytime, anywhere. Our platform is
                  designed to fit your schedule, whether you&apos;re a student,
                  working professional, or career changer.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <Zap className="mb-4 h-10 w-10 text-primaryPurple" />
                <h3 className="mb-2 text-xl font-semibold">
                  Hands-On Projects
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Apply what you learn through real-world projects and coding
                  challenges. Build a portfolio that showcases your skills to
                  potential employers.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <Target className="mb-4 h-10 w-10 text-primaryPurple" />
                <h3 className="mb-2 text-xl font-semibold">Career Support</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get guidance on career development, resume building, and job
                  preparation. We&apos;re committed to helping you achieve your
                  professional goals.
                </p>
              </div>
            </div>
          </div> */}

          {/* Why Choose Us */}
          {/* <div className="mb-16 rounded-2xl border border-gray-200 bg-gradient-to-br from-primaryPurple/10 to-blue-500/10 p-8 dark:border-[#333333]">
            <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
              Why Choose Educational Hub?
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryPurple text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Industry-Relevant Content
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our courses are designed with input from industry experts to
                    ensure you learn the most current and in-demand skills.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryPurple text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Affordable Pricing</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Quality education shouldn&apos;t break the bank. We offer
                    competitive pricing and regular discounts to make learning
                    accessible to everyone.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryPurple text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Lifetime Access</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Once you enroll, you get lifetime access to course
                    materials, so you can revisit and refresh your knowledge
                    anytime.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryPurple text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Community Support</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Join a vibrant community of learners, share experiences, ask
                    questions, and grow together with fellow students and
                    instructors.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryPurple text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Regular Updates</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Courses are regularly updated to reflect the latest industry
                    trends, tools, and best practices.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryPurple text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Mobile-Friendly</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Learn on any device - desktop, tablet, or mobile. Our
                    platform is optimized for seamless learning experiences
                    across all devices.
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Our Commitment */}
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Our Commitment to You
            </h2>
            <div className="mx-auto max-w-4xl">
              <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
                At Educational Hub, we are committed to providing you with the
                best possible learning experience. We continuously work to
                improve our platform, expand our course catalog, and enhance the
                quality of our content.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Whether you&apos;re looking to advance in your current career,
                switch to a new field, or simply learn something new, we&apos;re
                here to support your journey. Your success is our success, and
                we&apos;re dedicated to helping you achieve your goals.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-[#333333] dark:bg-[#1a1a1a]">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
              Join thousands of learners who are already advancing their careers
              with Educational Hub.
            </p>
            <a
              href="/courses"
              className="inline-block rounded-lg bg-primaryPurple px-8 py-3 text-white transition-colors hover:bg-primaryPurple/90"
            >
              Explore Courses
            </a>
          </div>

          {/* Call to Action - Donate */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-[#333333] dark:bg-[#1a1a1a]">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Support Our Mission?
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
              Your donations help us keep providing free educational resources
              to learners worldwide. Every contribution, big or small, makes a
              difference!
            </p>
            <a
              href="/donate"
              className="inline-block rounded-lg bg-primaryPurple px-8 py-3 text-white transition-colors hover:bg-primaryPurple/90"
            >
              Donate Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
