"use client";

import React, { useEffect, useState } from "react";
import { Button, Image, Skeleton, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useRouter } from "@bprogress/next/app";
import { useCourseLike } from "@/hooks/useCourseLike";

export type PlaceItem = {
  id: string;
  name: string;
  href: string;
  price: number | null;
  isNew?: boolean;
  rating?: number;
  ratingCount?: number;
  description?: string;
  htmlDescription?: string;
  imageSrc: string;
  tags: string[];
  slug?: string;
  instructor?: {
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

export type PlaceListItemProps = Omit<
  React.HTMLAttributes<HTMLAnchorElement>,
  "id"
> & {
  isLoading?: boolean;
  removeWrapper?: boolean;
} & PlaceItem;

const PlaceListItem = React.forwardRef<HTMLAnchorElement, PlaceListItemProps>(
  (
    {
      name,
      price,
      isLoading,
      description,
      htmlDescription,
      imageSrc,
      removeWrapper,
      className,
      tags,
      instructor,
      organization,
      ...props
    },
    ref,
  ) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isLastInRow, setIsLastInRow] = useState(false);
    const { liked, likeCourse, unlikeCourse, likesCount } = useCourseLike(
      props.slug || props.id,
    );

    useEffect(() => {
      const handleResize = () => {
        const element = document.querySelector(
          `[data-course-id="${props.id}"]`,
        ) as HTMLElement | null;
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          setIsLastInRow(rect.right > viewportWidth * 0.7);
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [props.id]);

    const handleTagClick = (tag: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/courses?search=${tag}`);
      return false;
    };

    const handleLikeClick = () => {
      if (liked) unlikeCourse();
      else likeCourse();
    };

    const handleCardClick = () => {
      router.push(`/courses/${props.slug}`);
    };

    return (
      <a
        ref={ref}
        data-course-id={props.id}
        href={`/courses/${props.slug}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex w-full flex-none cursor-pointer flex-col gap-3 rounded-xl border border-[#333333]",
          {
            "rounded-none bg-background shadow-none": removeWrapper,
          },
          className,
        )}
      >
        <Button
          isIconOnly
          className="absolute right-3 top-3 z-20 bg-background/60 backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
          radius="full"
          size="sm"
          variant="flat"
          onPress={handleLikeClick}
        >
          <Icon
            className={cn("text-default-900/50", {
              "text-danger-400": liked,
            })}
            icon="solar:heart-bold"
            width={16}
          />
        </Button>

        <div className="relative w-full overflow-hidden rounded-t-xl shadow-lg">
          <Image
            alt={name}
            className={`aspect-square !rounded-b-none !rounded-t-xl object-cover hover:scale-110 ${isLoading ? "w-[40em]" : "w-full"}`}
            isLoading={isLoading}
            src={imageSrc}
          />
        </div>

        <div className="mt-1 flex flex-1 flex-col justify-between gap-2 p-4">
          {isLoading ? (
            <div className="my-1 flex flex-col gap-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="mt-3 w-4/5 rounded-lg">
                <div className="h-3 w-4/5 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="mt-4 w-2/5 rounded-lg">
                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
              </Skeleton>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3
                    title={name}
                    className="line-clamp-3 text-xl font-medium text-default-700"
                  >
                    {name}
                  </h3>

                  <div className="flex items-center gap-2">
                    {likesCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Icon
                          className="text-danger-400"
                          icon="solar:heart-bold"
                          width={14}
                        />
                        <span className="text-default-500 text-small">
                          {likesCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="z-10 mt-3 flex flex-wrap gap-2">
                  {tags.slice(0, 3).map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => handleTagClick(tag, e)}
                      className="z-10 text-sm underline"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {instructor ? (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={
                      instructor.profile_image_url ||
                      `https://eu.ui-avatars.com/api/?name=${instructor.first_name}+${instructor.last_name}&size=32`
                    }
                    alt={`${instructor.first_name} ${instructor.last_name}`}
                    className="h-6 w-6 rounded-full object-cover"
                    width={24}
                    height={24}
                  />
                  <span className="text-xs text-default-500">
                    {instructor.first_name} {instructor.last_name}
                  </span>
                </div>
              ) : organization ? (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={
                      organization.logo ||
                      `https://eu.ui-avatars.com/api/?name=${organization.name}&size=32`
                    }
                    alt={organization.name}
                    className="h-6 w-6 rounded-full object-cover"
                    width={24}
                    height={24}
                  />
                  <span className="text-xs text-default-500">
                    {organization.name}
                  </span>
                </div>
              ) : null}

              {price === null ? null : (
                <p className="font-medium text-default-500 text-small">
                  ${price}
                </p>
              )}
            </>
          )}

          {isHovered && !isLoading && (
            <motion.div
              initial={{ opacity: 0, x: isLastInRow ? -100 : 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLastInRow ? -100 : 100 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className={cn(
                "absolute top-0 z-[30] flex h-full w-full transform flex-col rounded-lg bg-customWhite px-6 py-3 shadow-lg dark:bg-[#222222]",
                "hidden md:flex",
                {
                  "right-0 translate-x-10 translate-y-[-20px] md:left-[99%]":
                    !isLastInRow,
                  "-left-[100%] -translate-x-10 translate-y-[-20px] md:right-[99%]":
                    isLastInRow,
                },
              )}
            >
              <h3 className="text-xl font-bold">{name}</h3>

              <div className="mb-4 flex items-center gap-4">
                {instructor ? (
                  <>
                    <Image
                      src={
                        instructor.profile_image_url ||
                        `https://eu.ui-avatars.com/api/?name=${instructor.first_name}+${instructor.last_name}&size=40`
                      }
                      alt={`${instructor.first_name} ${instructor.last_name}`}
                      className="h-8 w-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                    <p className="text-sm">
                      {instructor.first_name} {instructor.last_name}
                    </p>
                  </>
                ) : organization ? (
                  <>
                    <Image
                      src={
                        organization.logo ||
                        `https://eu.ui-avatars.com/api/?name=${organization.name}&size=40`
                      }
                      alt={organization.name}
                      className="h-8 w-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                    <p className="text-sm">{organization.name}</p>
                  </>
                ) : (
                  <p className="text-sm">INSTRUCTOR</p>
                )}
              </div>

              <div className="overflow-auto">
                {htmlDescription ? (
                  <div
                    className="prose prose-sm prose-headings:text-sm prose-p:text-sm prose-p:mb-2 max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: htmlDescription }}
                  />
                ) : description ? (
                  <p className="text-sm">{description}</p>
                ) : (
                  <p className="text-sm">No description available</p>
                )}
              </div>

              {price ? (
                <div className="mb-4">
                  <p className="mb-2 text-sm">Price: ${price}</p>
                  <button
                    type="button"
                    className="w-full border border-black bg-[#01ffca] px-12 py-4 text-black"
                  >
                    Add to cart
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/courses/${props.slug}`)}
                    className="w-full border border-black bg-[#01ffca] px-12 py-4 text-black"
                  >
                    Enroll
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </a>
    );
  },
);

PlaceListItem.displayName = "PlaceListItem";

export default PlaceListItem;
