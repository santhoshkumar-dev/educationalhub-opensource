"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/custom/customButton";
import { useRouter } from "@bprogress/next/app";
import SimpleSelectDropdown, {
  Option,
} from "@/components/custom/SimpleSelectDropdown";
import { Plus } from "lucide-react";

const SORT_OPTIONS: Option[] = [
  { value: "", label: "Sort By" },
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

function CoursesPage() {
  const router = useRouter();
  const [sort, setSort] = useState("latest");
  const [totalCourses, setTotalCourses] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTotalCourses = async () => {
      try {
        const response = await fetch("/api/admin/courses/count");
        const data = await response.json();
        setTotalCourses(data.count);
      } catch (error) {
        console.error("Error fetching total courses:", error);
      }
    };

    fetchTotalCourses();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `/api/admin/courses?sort=${sort}&page=1&limit=10`,
        );
        const data = await response.json();
        setCourses(data.courses);
        setPage(1);
        setHasMore(data.courses.length >= 10);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [sort]);

  const loadMoreCourses = async () => {
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/admin/courses?sort=${sort}&page=${nextPage}&limit=10`,
      );
      const data = await response.json();
      setCourses((prev) => [...prev, ...data.courses]);
      setPage(nextPage);
      if (data.courses.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Error loading more courses:", error);
    }
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  return (
    <section className="px-10 py-10">
      <h1 className="custom-h1">Courses Dashboard</h1>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Courses</h3>
            <p className="text-white/50">{totalCourses} courses created</p>
          </div>

          <div className="space-y-5">
            <CustomButton
              onClick={() => router.push("/admin/dashboard/create-course")}
            >
              <div className="flex items-center gap-2">
                <Plus /> Create Course
              </div>
            </CustomButton>
            <SimpleSelectDropdown
              label="Sort By"
              options={SORT_OPTIONS}
              defaultValue="latest"
              onChange={handleSortChange}
            />
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-6">
          {courses.map((course) => (
            <li
              key={course._id}
              onClick={() =>
                router.push(`/admin/dashboard/create-course?id=${course._id}`)
              }
              className="flex h-[30rem] w-[20rem] cursor-pointer flex-col overflow-hidden rounded border shadow-lg"
            >
              <div className="flex h-[18rem] items-center justify-center bg-gray-300">
                <Image
                  width={300}
                  height={300}
                  src={course.course_image || "/placeholder-course.png"}
                  alt={course.course_name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between bg-[#111] text-white">
                <div className="flex h-full flex-col justify-between p-4">
                  <h3 className="mb-2 line-clamp-2 text-base font-semibold">
                    {course.course_name}
                  </h3>
                  <p className="text-sm text-gray-400">{"course.instructor"}</p>
                </div>

                <button
                  type="button"
                  className="mt-4 bg-primaryPurple py-4 text-sm hover:underline"
                >
                  Edit Course
                </button>
              </div>
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <CustomButton onClick={loadMoreCourses}>Load More</CustomButton>
          </div>
        )}
      </div>
    </section>
  );
}

export default CoursesPage;
