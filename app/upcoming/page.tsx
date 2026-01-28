"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardFooter, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

type UpcomingCourse = {
  _id: string;
  courseName: string;
  courseUrl: string;
  platform: string;
  votes: number;
};

export default function UpcomingPage() {
  const [courses, setCourses] = useState<UpcomingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [votedCourses, setVotedCourses] = useState<string[]>([]);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/upcoming-courses");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCourses(data.courses || []);

      const storedVotes = JSON.parse(
        localStorage.getItem("votedCourses") || "[]",
      );
      setVotedCourses(storedVotes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/cron/sync-upcoming");
      const data = await res.json();
      toast.success(
        `Synced! Added: ${data.stats?.added}, Updated: ${data.stats?.updated}`,
      );
      fetchUpcoming(); // Refresh list
    } catch (e) {
      console.error(e);
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedCourses.includes(id)) return;

    setCourses((prev) =>
      prev.map((c) => (c._id === id ? { ...c, votes: c.votes + 1 } : c)),
    );
    setVotedCourses((prev) => {
      const newVotes = [...prev, id];
      localStorage.setItem("votedCourses", JSON.stringify(newVotes));
      return newVotes;
    });

    try {
      await fetch("/api/upcoming-courses/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  return (
    <div className="container mx-auto min-h-screen max-w-7xl p-6">
      <div className="mb-10 mt-5 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white md:text-5xl">
            Vote for Next Courses
          </h1>
          <p className="mt-2 text-default-500">
            Help us decide which courses to add next by voting!
          </p>
        </div>
        <Button
          isLoading={syncing}
          onPress={handleSync}
          className="mt-4 bg-[#333] text-white md:mt-0"
          startContent={!syncing && <Icon icon="solar:refresh-bold" />}
        >
          Refresh Requests
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course._id}
              className="border border-[#333333] bg-customWhite transition-all hover:border-[#01ffca] dark:bg-[#1e1e1e]"
            >
              <CardBody className="p-5 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold leading-tight">
                    {course.courseName}
                  </h3>
                </div>

                <a
                  href={course.courseUrl}
                  target="_blank"
                  className="my-2 line-clamp-2 text-sm text-default-500 transition-all hover:text-primaryPurple"
                >
                  {course.courseUrl}
                </a>

                {course.platform && (
                  <p className="mt-2 text-sm text-default-500">
                    {course.platform}
                  </p>
                )}
              </CardBody>
              <CardFooter className="flex items-center justify-between border-t border-[#333]/10 px-5 py-4 dark:border-[#333]">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-[#01ffca]/10 p-2 text-[#01ffca]">
                    <Icon icon="solar:fire-bold" width={20} />
                  </div>
                  <span className="text-xl font-bold">{course.votes}</span>
                </div>
                <Button
                  size="md"
                  color={
                    votedCourses.includes(course._id) ? "default" : "primary"
                  }
                  variant={votedCourses.includes(course._id) ? "flat" : "solid"}
                  disabled={votedCourses.includes(course._id)}
                  onPress={() => handleVote(course._id)}
                  className={
                    votedCourses.includes(course._id)
                      ? "opacity-50"
                      : "bg-[#01ffca] font-bold text-black"
                  }
                >
                  {votedCourses.includes(course._id) ? "Voted" : "Vote This"}
                </Button>
              </CardFooter>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-10 text-center text-default-500">
              No requests found. Try syncing!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
