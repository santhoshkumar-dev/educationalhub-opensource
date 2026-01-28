import React from "react";
import { Skeleton } from "@heroui/react";
import { MdOutlineArrowRight } from "react-icons/md";

export const CourseSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-3">
        <Skeleton className="h-4 w-16 rounded-lg">
          <div className="h-4 w-16 rounded-lg bg-default-200" />
        </Skeleton>
        <span className="mx-2 text-gray-400">
          <MdOutlineArrowRight />
        </span>
        <Skeleton className="h-4 w-32 rounded-lg">
          <div className="h-4 w-32 rounded-lg bg-default-200" />
        </Skeleton>
      </div>
      <div className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Video player skeleton */}
          <div className="w-full lg:w-3/4">
            <Skeleton className="aspect-video w-full rounded-lg">
              <div className="aspect-video w-full rounded-lg bg-default-200" />
            </Skeleton>

            {/* Video title and like button skeleton */}
            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-3/4 rounded-lg">
                  <div className="h-8 w-3/4 rounded-lg bg-default-200" />
                </Skeleton>
                <Skeleton className="h-5 w-1/2 rounded-lg">
                  <div className="h-5 w-1/2 rounded-lg bg-default-200" />
                </Skeleton>
              </div>
              <Skeleton className="h-10 w-24 rounded-lg">
                <div className="h-10 w-24 rounded-lg bg-default-200" />
              </Skeleton>
            </div>
          </div>

          {/* Video list sidebar skeleton */}
          <div className="w-full lg:w-1/4">
            <div className="space-y-3 rounded-lg p-4">
              <Skeleton className="h-6 w-32 rounded-lg">
                <div className="h-6 w-32 rounded-lg bg-default-200" />
              </Skeleton>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg">
                  <div className="h-12 w-full rounded-lg bg-default-200" />
                </Skeleton>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course details section skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main course info skeleton */}
        <div className="space-y-6 lg:col-span-2">
          {/* Course card skeleton */}
          <div className="rounded-xl border border-[#333333] p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="md:w-1/3">
                <Skeleton className="aspect-[4/3] w-full rounded-lg">
                  <div className="aspect-[4/3] w-full rounded-lg bg-default-200" />
                </Skeleton>
              </div>
              <div className="space-y-4 md:w-2/3">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 rounded-lg">
                    <div className="h-6 w-48 rounded-lg bg-default-200" />
                  </Skeleton>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20 rounded-lg">
                      <div className="h-4 w-20 rounded-lg bg-default-200" />
                    </Skeleton>
                    <Skeleton className="h-4 w-24 rounded-lg">
                      <div className="h-4 w-24 rounded-lg bg-default-200" />
                    </Skeleton>
                    <Skeleton className="h-4 w-20 rounded-lg">
                      <div className="h-4 w-20 rounded-lg bg-default-200" />
                    </Skeleton>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full">
                    <div className="h-6 w-16 rounded-full bg-default-200" />
                  </Skeleton>
                  <Skeleton className="h-6 w-20 rounded-full">
                    <div className="h-6 w-20 rounded-full bg-default-200" />
                  </Skeleton>
                  <Skeleton className="w-18 h-6 rounded-full">
                    <div className="w-18 h-6 rounded-full bg-default-200" />
                  </Skeleton>
                </div>
              </div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="rounded-xl border border-[#333333] p-6">
            <Skeleton className="mb-4 h-6 w-32 rounded-lg">
              <div className="h-6 w-32 rounded-lg bg-default-200" />
            </Skeleton>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-lg">
                <div className="h-4 w-full rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="h-4 w-5/6 rounded-lg">
                <div className="h-4 w-5/6 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="h-4 w-4/5 rounded-lg">
                <div className="h-4 w-4/5 rounded-lg bg-default-200" />
              </Skeleton>
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#333333] p-6">
            <Skeleton className="mb-4 h-6 w-24 rounded-lg">
              <div className="h-6 w-24 rounded-lg bg-default-200" />
            </Skeleton>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full">
                <div className="h-16 w-16 rounded-full bg-default-200" />
              </Skeleton>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-lg">
                  <div className="h-5 w-32 rounded-lg bg-default-200" />
                </Skeleton>
                <Skeleton className="h-4 w-20 rounded-lg">
                  <div className="h-4 w-20 rounded-lg bg-default-200" />
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
