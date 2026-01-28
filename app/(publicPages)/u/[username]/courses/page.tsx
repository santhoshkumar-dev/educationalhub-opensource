"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function CoursesPage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/u/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.publishedCourses || []);
      })
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="w-full p-8">
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
            <h2 className="text-3xl font-bold">Published Courses</h2>
          </div>
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <p className="text-white/50">No courses published yet.</p>
          )}
        </>
      )}
    </div>
  );
}

type CourseProps = {
  course: {
    _id: string;
    slug: string;
    course_name: string;
    course_image: string;
    views: number;
    likes?: number;
  };
};

function CourseCard({ course }: CourseProps) {
  const router = useRouter();
  return (
    <div
      className="flex cursor-pointer flex-col overflow-hidden border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
      onClick={() => router.push(`/courses/${course.slug}`)}
    >
      <Image
        src={course.course_image}
        alt={course.course_name}
        className="h-[350px] w-full object-cover"
        width={400}
        height={350}
      />
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-lg font-semibold text-white">
          {course.course_name}
        </h3>
        <p className="text-sm text-white/50">Course slug: {course.slug}</p>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <p className="text-white/70">Views: {course.views}</p>
          <div className="flex items-center gap-1 text-sm text-white/70">
            <Heart size={18} />
            <span>{course.likes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
