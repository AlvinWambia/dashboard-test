'use server';

import { headers } from 'next/headers';

// Simple in-memory rate limiter
const rateLimitMap = new Map();

export async function checkAuthRateLimit() {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    const limit = 5; // Max 5 attempts
    const windowMs = 60 * 1000; // 1 minute window

    const now = Date.now();
    const windowStart = now - windowMs;

    const requestLog = rateLimitMap.get(ip) || [];
    const requestsInWindow = requestLog.filter(time => time > windowStart);

    if (requestsInWindow.length >= limit) {
      return { error: 'Too many attempts. Please try again later.' };
    }

    requestsInWindow.push(now);
    rateLimitMap.set(ip, requestsInWindow);
    
    return { success: true };
  } catch (error) {
    console.error("Rate limit check failed", error);
    return { success: true }; // Fallback to allow if error
  }
}
