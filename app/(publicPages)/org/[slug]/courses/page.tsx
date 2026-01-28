"use client";
import Image from "next/image";
import PlaceListItem from "@/components/hero-ui/place-list-item";
import { useOrg } from "../OrgContext";

export default function OrganizationPage() {
  const { organization, courses } = useOrg();

  return (
    <section>
      <div className="p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">Courses</h2>
        </div>

        {courses?.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <PlaceListItem
                key={course._id}
                id={course._id}
                name={course.course_name}
                href={`/courses/${course.slug}`}
                slug={course.slug}
                price={null}
                imageSrc={course.course_image || "/placeholder.png"}
                tags={course.tags || []}
                description={course.description}
                htmlDescription={course.htmlDescription}
                organization={course.organization}
              />
            ))}
          </div>
        ) : (
          <p className="text-white/50">No courses published yet.</p>
        )}
      </div>
    </section>
  );
}
