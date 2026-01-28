import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";

interface CourseBreadcrumbProps {
  courseName: string;
}

export const CourseBreadcrumb: React.FC<CourseBreadcrumbProps> = ({
  courseName,
}) => {
  return (
    <div className="mb-4 flex items-center text-sm">
      <a
        href="/courses"
        className="hover: transition-colors dark:hover:text-gray-200"
      >
        Courses
      </a>
      <span className="mx-2 text-gray-400">
        <MdOutlineArrowRight />
      </span>
      <span className="font-medium">{courseName}</span>
    </div>
  );
};
