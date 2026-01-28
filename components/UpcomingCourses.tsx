"use client";

import { useEffect, useState } from "react";
import { Skeleton, Card, CardBody, CardFooter, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

type UpcomingCourse = {
  _id: string; // MongoDB _id
  courseName: string; // From DB
  description: string;
  votes: number;
  platform: string;
};

export default function UpcomingCourses() {
  const [courses, setCourses] = useState<UpcomingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedCourses, setVotedCourses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch("/api/upcoming-courses");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setCourses(data.courses || []);

        // Restore voted state from local storage
        const storedVotes = JSON.parse(
          localStorage.getItem("votedCourses") || "[]",
        );
        setVotedCourses(storedVotes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  const handleVote = async (id: string) => {
    if (votedCourses.includes(id)) {
      toast.info("You already voted for this course!");
      return;
    }

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c._id === id ? { ...c, votes: c.votes + 1 } : c)),
    );
    setVotedCourses((prev) => {
      const newVotes = [...prev, id];
      localStorage.setItem("votedCourses", JSON.stringify(newVotes));
      return newVotes;
    });

    try {
      const res = await fetch("/api/upcoming-courses/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("Failed to register vote");
      // Revert optimistic update? For now let's leave it to avoid jarring UI
    }
  };

  if (!loading && courses.length === 0) return null;

  return (
    <div className="my-8">
      <div className="mb-6 flex items-center">
        <h2 className="text-2xl font-bold text-black dark:text-white md:text-4xl">
          Upcoming Courses
        </h2>
        <div className="ml-4 h-0.5 flex-1 bg-[#333333]"></div>
        <Button
          as="a"
          href="/upcoming"
          variant="light"
          className="ml-4 underline"
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="border border-[#333333] bg-transparent shadow-none"
              >
                <CardBody className="p-4">
                  <Skeleton className="mb-2 h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </CardBody>
                <CardFooter className="flex items-center justify-between px-4 py-3">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </CardFooter>
              </Card>
            ))
          : courses.slice(0, 6).map((course) => (
              <Card
                key={course._id}
                className="border border-[#333333] bg-[#fafafa] shadow-sm transition-colors hover:border-[#01ffca] dark:bg-[#1e1e1e]"
              >
                <CardBody className="p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="line-clamp-2 text-lg font-bold">
                      {course.courseName}
                    </h3>
                    {course.platform && (
                      <span className="rounded bg-[#333333] px-2 py-1 text-[10px] text-white">
                        {course.platform}
                      </span>
                    )}
                  </div>
                </CardBody>
                <CardFooter className="flex items-center justify-between px-5 py-4 pt-0">
                  <div className="flex items-center gap-1 text-[#01ffca]">
                    <Icon icon="solar:fire-bold" width={18} />
                    <span className="font-bold">{course.votes}</span>
                  </div>
                  <Button
                    size="sm"
                    color={
                      votedCourses.includes(course._id) ? "default" : "primary"
                    }
                    variant={
                      votedCourses.includes(course._id) ? "flat" : "solid"
                    }
                    disabled={votedCourses.includes(course._id)}
                    onPress={() => handleVote(course._id)}
                    className={
                      votedCourses.includes(course._id)
                        ? "opacity-50"
                        : "bg-[#01ffca] font-semibold text-black"
                    }
                  >
                    {votedCourses.includes(course._id) ? "Voted" : "Vote"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
}
