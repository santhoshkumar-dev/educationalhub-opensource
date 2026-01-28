"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutPage() {
  const params = useParams();
  const username = params.username as string;

  const [bio, setBio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    fetch(`/api/u/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setBio(data.user.bio);
      })
      .catch((err) => console.error("Failed to fetch user bio:", err))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <Skeleton className="h-4 w-full bg-white/20" />
        <Skeleton className="h-4 w-11/12 bg-white/20" />
        <Skeleton className="h-4 w-full bg-white/20" />
      </div>
    );
  }

  return (
    <div className="prose prose-invert mx-auto max-w-2xl text-center">
      {bio ? (
        <div dangerouslySetInnerHTML={{ __html: bio }} />
      ) : (
        <p>This user has not written a bio yet.</p>
      )}
    </div>
  );
}
