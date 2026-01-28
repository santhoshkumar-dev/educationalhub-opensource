"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { useRouter } from "@bprogress/next/app";
import PlaceListItem from "@/components/hero-ui/place-list-item";

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

export default function LikedCoursesPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [likedCourses, setLikedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/u/${username}/liked-courses`)
      .then((res) => res.json())
      .then((data) => {
        setLikedCourses(data.likedCourses || []);
      })
      .catch((err) => {
        console.error("Failed to fetch liked courses:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  return (
    <section className="min-h-screen">
      <div>
        {loading ? (
          <>
            <Skeleton className="mb-4 h-6 w-48 bg-white/20" />
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="mb-4 h-[350px] w-full rounded-lg bg-white/20"
                />
              ))}
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-bold">Liked Courses</h2>
            </div>
            {likedCourses && likedCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {likedCourses.map((course) => (
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
              <p className="text-white/50">
                This user has not liked any courses yet.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
