import { useState, useEffect } from "react";

export function useFollow(username: string, setFollowers?: (c: number) => void) {
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/users/${username}/follow-status`);
        const data = await res.json();
        if (res.ok) {
          setFollowed(data.followed);
          if (setFollowers) setFollowers(data.followers);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [username]);

  const follow = async () => {
    if (followed) return;
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setFollowed(true);
      if (setFollowers) setFollowers(data.followers);
    }
  };

  const unfollow = async () => {
    if (!followed) return;
    const res = await fetch(`/api/users/${username}/follow`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setFollowed(false);
      if (setFollowers) setFollowers(data.followers);
    }
  };

  return { followed, follow, unfollow };
}
