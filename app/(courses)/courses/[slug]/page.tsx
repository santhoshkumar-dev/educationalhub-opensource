import { Metadata } from "next";
import CourseIdClient from "./CourseIdClient";
import StructuredData from "@/components/SEO/StructuredData";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(
      `https://educationalhub.in/api/courses/${params.slug}`,
      { next: { revalidate: 3600 } }, // Revalidate every hour
    );
    const data = await res.json();
    const course = data.course;

    if (!course) {
      return {
        title: "Course Not Found - Educational Hub",
        description:
          "This course does not exist or has been removed from Educational Hub.",
        alternates: {
          canonical: `https://educationalhub.in/courses/${params.slug}`,
        },
      };
    }

    const description = course.description
      ? course.description.slice(0, 160)
      : `Learn ${course.course_name} on Educational Hub. Comprehensive online course with expert instruction.`;

    return {
      title: `${course.course_name} - Educational Hub | Online Course`,
      description,
      keywords: course.tags || [course.course_name, "online course", "Educational Hub"],
      openGraph: {
        title: `${course.course_name} - Educational Hub`,
        description,
        url: `https://educationalhub.in/courses/${params.slug}`,
        siteName: "Educational Hub",
        images: [
          {
            url: course.course_image,
            width: 1200,
            height: 630,
            alt: course.course_name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${course.course_name} - Educational Hub`,
        description,
        images: [course.course_image],
      },
      alternates: {
        canonical: `https://educationalhub.in/courses/${params.slug}`,
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
  } catch (e) {
    console.error("Error fetching course data:", e);
    return {
      title: "Educational Hub - Learn & Grow",
      description: "Browse online courses to enhance your career.",
      alternates: {
        canonical: `https://educationalhub.in/courses/${params.slug}`,
      },
    };
  }
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  // Fetch course data for structured data
  let courseSchema = null;
  try {
    const res = await fetch(
      `https://educationalhub.in/api/courses/${params.slug}`,
      { next: { revalidate: 3600 } },
    );
    const data = await res.json();
    const course = data.course;

    if (course) {
      courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.course_name,
        description: course.description || course.htmlDescription,
        image: course.course_image,
        url: `https://educationalhub.in/courses/${params.slug}`,
        provider: {
          "@type": "Organization",
          name: course.organization?.name || "Educational Hub",
          url: "https://educationalhub.in",
        },
        ...(course.instructors?.[0] && {
          instructor: {
            "@type": "Person",
            name: `${course.instructors[0].first_name} ${course.instructors[0].last_name}`,
            image: course.instructors[0].profile_image_url,
          },
        }),
        ...(course.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: course.rating,
            ratingCount: course.views || 0,
          },
        }),
        ...(course.total_videos && {
          numberOfCredits: course.total_videos,
        }),
        ...(course.tags && {
          keywords: course.tags.join(", "),
        }),
      };

      // Add BreadcrumbList schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://educationalhub.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Courses",
            item: "https://educationalhub.in/courses",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: course.course_name,
            item: `https://educationalhub.in/courses/${params.slug}`,
          },
        ],
      };

      courseSchema = [courseSchema, breadcrumbSchema];
    }
  } catch (error) {
    console.error("Error generating course schema:", error);
  }

  return (
    <>
      {courseSchema && <StructuredData data={courseSchema} />}
      <CourseIdClient params={{ slug: params.slug }} />
    </>
  );
}
