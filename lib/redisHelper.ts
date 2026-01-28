import redis from "./redis";

type Cacheable<T> = () => Promise<T>;

/**
 * Get from Redis cache or fallback to DB and set it.
 * @param key Redis key
 * @param fetchFn Async function to fetch fresh data
 * @param ttlInSeconds Time to live in seconds (default 600s = 10 min)
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: Cacheable<T>,
  ttlInSeconds = 600,
): Promise<T> {
  // Redis disabled for now - always fetch fresh data
  const data = await fetchFn();
  return data;

  // Original Redis code commented out:
  // const cached = await redis.get(key);
  // if (cached) {
  //   return JSON.parse(cached) as T;
  // }
  // const data = await fetchFn();
  // await redis.set(key, JSON.stringify(data), "EX", ttlInSeconds);
  // return data;
}

/**
 * Delete Redis cache by key or pattern
 */
export async function deleteCache(key: string | RegExp | string[]) {
  // Redis disabled for now - no-op function
  return;

  // Original Redis code commented out:
  // if (typeof key === "string") {
  //   await redis.del(key);
  // } else if (key instanceof RegExp) {
  //   const allKeys = await redis.keys("*");
  //   const matchingKeys = allKeys.filter((k) => key.test(k));
  //   if (matchingKeys.length) await redis.del(...matchingKeys);
  // } else if (Array.isArray(key)) {
  //   await redis.del(...key);
  // }
}
