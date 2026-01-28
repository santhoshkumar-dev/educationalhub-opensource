"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import PlaceListItem from "@/components/hero-ui/place-list-item";

// Type definition for a Course object
type Course = {
  course_name: string;
  course_image: string;
  _id: string;
  total_videos: number;
  slug: string;
  tags: string[];
  isPaid: boolean;
  description?: string;
  htmlDescription?: string;
  instructor: {
    first_name: string;
    last_name: string;
    email: string;
    clerk_id: string;
    profile_image_url: string;
  };
  organization?: {
    name: string;
    logo?: string;
    _id: string;
  };
};

// Renamed the component to better reflect its purpose
export default function EnrolledCoursesPage() {
  const params = useParams();
  const username = params.username as string;

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    // Fetch data from the new, dedicated endpoint for enrolled courses
    fetch(`/api/u/${username}/enrolled-courses`)
      .then((res) => res.json())
      .then((data) => {
        // The new endpoint returns an object with an 'enrolledCourses' key
        setEnrolledCourses(data.enrolledCourses || []);
      })
      .catch((err) => {
        console.error("Failed to fetch enrolled courses:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="w-full">
      {loading ? (
        // --- Loading State Skeleton ---
        <>
          <Skeleton className="mb-6 h-8 w-64 bg-white/20" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-[350px] w-full rounded-lg bg-white/20"
                />
              ))}
          </div>
        </>
      ) : (
        // --- Loaded State ---
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-bold">Enrolled Courses</h2>
          </div>

          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {enrolledCourses.map((course) => (
                <PlaceListItem
                  key={course._id}
                  id={course._id}
                  name={course.course_name}
                  href={`/courses/${course.slug}`} // Using slug for a cleaner URL is a good practice
                  price={course.isPaid ? 99 : null} // Example price
                  rating={4.5} // This would likely come from your API in a real app
                  ratingCount={150} // This would also come from your API
                  description={course.description}
                  htmlDescription={course.htmlDescription}
                  imageSrc={course.course_image}
                  isNew={false}
                  tags={course.tags}
                  slug={course.slug}
                  instructor={course.instructor}
                  organization={course.organization}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-white/5">
              <p className="text-white/60">
                This user has not enrolled in any courses yet.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
