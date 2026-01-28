"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
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
  purchasedAt?: string;
  accessExpiryDate?: string | null;
  paymentId?: string;
};

export default function PurchasedCoursesPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/u/${username}/purchased-courses`)
      .then((res) => res.json())
      .then((data) => {
        setPurchasedCourses(data.purchasedCourses || []);
      })
      .catch((err) => {
        console.error("Failed to fetch purchased courses:", err);
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
              <h2 className="text-3xl font-bold">Purchased Courses</h2>
            </div>

            {purchasedCourses && purchasedCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {purchasedCourses.map((course) => (
                  <PlaceListItem
                    key={course._id}
                    id={course._id}
                    name={course.course_name}
                    href={`/courses/${course.slug}`}
                    price={course.isPaid ? 99 : null}
                    rating={4.5}
                    ratingCount={150}
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
                This user has not purchased any courses yet.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
