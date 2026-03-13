/**
 * getURL ensures that we get the correct base URL for both local development
 * and deployed environments (like Vercel).
 */
export const getURL = (path = "") => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your custom domain in production
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for preview/production
        "http://localhost:3000/";

    // Make sure to include `https://` when not localhost.
    url = url.includes("http") ? url : `https://${url}`;
    
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;

    // Remove leading `/` from path if it exists to avoid double slashes
    const cleanPath = path.charAt(0) === "/" ? path.slice(1) : path;

    return `${url}${cleanPath}`;
};
