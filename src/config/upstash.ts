import { Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const createRateLimit = (limitNumber: number, window: Duration = "60s") => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limitNumber, window)
  })
}

export const messageRateLimit = createRateLimit(30);