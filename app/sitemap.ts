import type { MetadataRoute } from "next";
import connectMongoDB from "@/lib/connectMongoDB";
import Course from "@/models/course";
import CourseCategory from "@/models/course-category";

const BASE_URL = "https://educationalhub.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectMongoDB();

    // Fetch all approved courses with their slugs and updated dates
    const courses = await Course.find({ status: "approved" })
      .select("slug updatedAt createdAt")
      .lean();

    // Fetch all categories with their slugs
    const categories = await CourseCategory.find()
      .select("slug updatedAt")
      .lean();

    // Static pages with optimized SEO settings
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/courses`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/category`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/resources`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/donate`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/sign-up`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/sign-in`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
      // Legal pages
      {
        url: `${BASE_URL}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${BASE_URL}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${BASE_URL}/dmca`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${BASE_URL}/shipping-delivery`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
    ];

    // Dynamic course pages
    const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
      url: `${BASE_URL}/courses/${course.slug}`,
      lastModified: course.updatedAt || course.createdAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Dynamic category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${BASE_URL}/category/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Combine all pages
    return [...staticPages, ...coursePages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to static pages only if database fails
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/courses`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/resources`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/sign-up`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/sign-in`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
    ];
  }
}
