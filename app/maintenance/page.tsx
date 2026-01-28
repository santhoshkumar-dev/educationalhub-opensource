import { Metadata } from "next";
import { Wrench, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Under Maintenance - Educational Hub",
  description:
    "Educational Hub is currently under maintenance. We'll be back soon with improvements and updates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-customWhite text-black dark:bg-[#191919] dark:text-[#fff]">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primaryPurple/10 p-6 dark:bg-primaryPurple/20">
              <Wrench className="h-16 w-16 text-primaryPurple" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            We&apos;re Under Maintenance
          </h1>

          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            We&apos;re currently working on improving our platform to provide you
            with a better learning experience.
          </p>

          {/* Status Info */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <div className="mb-4 flex items-center justify-center gap-2 text-primaryPurple">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Estimated Time</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              We expect to be back online shortly. Thank you for your patience!
            </p>
          </div>

          {/* What We're Doing */}
          <div className="mb-8 text-left">
            <h2 className="mb-4 text-2xl font-semibold">
              What We&apos;re Working On:
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primaryPurple">•</span>
                <span>Enhancing platform performance and speed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primaryPurple">•</span>
                <span>Adding new features and improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primaryPurple">•</span>
                <span>Updating course content and resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primaryPurple">•</span>
                <span>Improving user experience and interface</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <p className="mb-2 text-gray-600 dark:text-gray-400">
              Need immediate assistance?
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Contact us at{" "}
              <a
                href="mailto:support@educationalhub.in"
                className="text-primaryPurple hover:underline"
              >
                support@educationalhub.in
              </a>
            </p>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#252525]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go to Homepage</span>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
            We apologize for any inconvenience. We&apos;ll be back soon!
          </p>
        </div>
      </div>
    </div>
  );
}

