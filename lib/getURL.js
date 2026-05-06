/**
 * getURL ensures that we get the correct base URL for both local development
 * and deployed environments (like Vercel).
 */
export const getURL = (path = "") => {
    // Check if we are in a browser environment
    const isBrowser = typeof window !== 'undefined';

    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
        (isBrowser ? window.location.origin : "http://localhost:3000/");

    // Ensure protocol
    url = url.includes("http") ? url : `https://${url}`;
    // Ensure trailing slash
    url = url.endsWith("/") ? url : `${url}/`;

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${url}${cleanPath}`;
};
