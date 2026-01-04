import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const hasUpstashEnv =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const authLimit = toPositiveInt(process.env.RATE_LIMIT_AUTH_MAX, 20);
const authWindow = process.env.RATE_LIMIT_AUTH_WINDOW || "15 m";
const aiLimit = toPositiveInt(process.env.RATE_LIMIT_AI_MAX, 30);
const aiWindow = process.env.RATE_LIMIT_AI_WINDOW || "1 h";

let authLimiter = null;
let aiLimiter = null;

if (hasUpstashEnv) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(authLimit, authWindow),
    analytics: true,
    prefix: "ratelimit:auth",
  });

  aiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(aiLimit, aiWindow),
    analytics: true,
    prefix: "ratelimit:ai",
  });
}

let warnedMissing = false;

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

const createRateLimitMiddleware = (limiter, getKey) => async (req, res, next) => {
  if (!limiter) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn(
        "Rate limiting disabled: missing Upstash env vars (UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN)."
      );
    }
    return next();
  }

  try {
    const key = getKey(req);
    const { success, limit, remaining, reset } = await limiter.limit(key);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    return next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    return next();
  }
};

const authRateLimit = createRateLimitMiddleware(authLimiter, (req) => {
  return `ip:${getClientIp(req)}`;
});

const aiRateLimit = createRateLimitMiddleware(aiLimiter, (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return `ip:${getClientIp(req)}`;
});

export { authRateLimit, aiRateLimit };
