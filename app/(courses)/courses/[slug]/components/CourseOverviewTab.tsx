import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface Course {
  course_name: string;
  views: number;
  total_videos: number;
  chapters: any[];
  tags: string[];
  instructors?: {
    _id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
  }[];
  organization?: {
    name: string;
    logo?: string;
    slug: string;
  };
}

interface CourseOverviewTabProps {
  course: Course;
  isExpanded: boolean;
  onToggle: () => void;
  snippet: string;
  fullText: string;
  router: AppRouterInstance;
}

export const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({
  course,
  isExpanded,
  onToggle,
  snippet,
  fullText,
  router,
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#333333] p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-xl font-bold">{course.course_name}</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:eye" className="h-4 w-4" />
                  {course.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:play-circle" className="h-4 w-4" />
                  {course.total_videos} videos
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:book-open" className="h-4 w-4" />
                  {course.chapters.length} chapters
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/courses?search=${tag}`)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#333333] p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          {course.instructors && course.instructors.length > 0
            ? "Instructor"
            : "Organization"}
        </h3>

        {course.instructors && course.instructors.length > 0 ? (
          <div className="space-y-4">
            {course.instructors.map((inst: any) => (
              <div key={inst._id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={
                      inst.profile_image_url ||
                      "https://via.placeholder.com/150"
                    }
                    alt={`${inst.first_name} ${inst.last_name}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {inst.first_name} {inst.last_name}
                  </p>
                  <p className="text-sm">Instructor</p>
                </div>
              </div>
            ))}
          </div>
        ) : course.organization ? (
          <div
            onClick={() => router.push(`/org/${course.organization?.slug}`)}
            className="flex cursor-pointer items-center gap-4"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={
                  course.organization.logo ||
                  `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(course.organization.name)}&size=150`
                }
                alt={course.organization.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <p className="font-semibold">{course.organization.name}</p>
              <p className="text-sm">Organization</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src="https://via.placeholder.com/150"
                alt="Default instructor"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <p className="font-semibold">Anonymous</p>
              <p className="text-sm">Instructor</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#333333] p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Description</h3>
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: isExpanded ? fullText : snippet,
          }}
        />
        {fullText.length > 500 && (
          <button
            onClick={onToggle}
            className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? "Read Less" : "Read More..."}
          </button>
        )}
      </div>
    </div>
  );
};
