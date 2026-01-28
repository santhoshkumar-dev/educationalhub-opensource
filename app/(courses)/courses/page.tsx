import { Metadata } from "next";
import Courses from "./Courses";

export const metadata: Metadata = {
  title: "Explore Online Courses - Educational Hub",
  description:
    "Discover a variety of high-quality online courses at Educational Hub. Learn programming, technology, business skills, and more to accelerate your career growth.",
  keywords: [
    "Online courses",
    "Educational Hub courses",
    "Career growth courses",
    "Programming courses",
    "Technology courses",
    "Best online courses India",
    "Skill development programs",
    "Learn coding online",
    "Professional certification courses",
    "Affordable online learning",
    "Educational websites like Udemy",
    "Top e-learning platforms",
    "Online classes for career",
  ],
  openGraph: {
    title: "Explore Online Courses - Educational Hub",
    description:
      "Browse top online courses and enhance your skills with Educational Hub. Find programming, business, and tech courses tailored for career advancement.",
    url: "https://educationalhub.in/courses",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Courses - Educational Hub",
    description:
      "Discover a wide range of online courses at Educational Hub and start building your career today.",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
};

export default function Page() {
  return <Courses />;
}
