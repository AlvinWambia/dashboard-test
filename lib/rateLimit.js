import { NextResponse } from "next/server";

// In-memory sliding window store
const rateLimitStore = new Map();

// Periodic cleanup of expired entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Gets client IP from request headers
 */
export function getClientIp(req) {
  if (!req || !req.headers) return "127.0.0.1";
  
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Applies rate limiting to a request.
 * 
 * @param {Request} req - The incoming request object
 * @param {Object} options
 * @param {number} options.limit - Max allowed requests within window (default: 10)
 * @param {number} options.windowMs - Time window in ms (default: 60,000 = 1 min)
 * @param {string} [options.keyPrefix] - Optional prefix to separate limits per endpoint
 * @param {string} [options.customIdentifier] - Optional custom identifier (e.g. user ID)
 * 
 * @returns {NextResponse|null} Returns NextResponse with 429 status if rate limited, or null if allowed.
 */
export function checkRateLimit(req, options = {}) {
  const {
    limit = 10,
    windowMs = 60 * 1000,
    keyPrefix = "api",
    customIdentifier = null,
  } = options;

  const identifier = customIdentifier || getClientIp(req);
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return null; // Allowed
  }

  record.count += 1;

  if (record.count > limit) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
        },
      }
    );
  }

  return null; // Allowed
}
