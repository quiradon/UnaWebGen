import type { MiddlewareHandler } from "astro";

const NON_HTML_PREFIXES = ["/_astro/", "/img/", "/scripts/"];
const DEFAULT_SSR_CACHE_CONTROL = "public, max-age=604800, s-maxage=604800";

const shouldSkipPath = (pathname: string) =>
  NON_HTML_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const hasAuthHeaders = (request: Request) =>
  request.headers.has("Cookie") || request.headers.has("Authorization");

const isCacheableResponse = (response: Response) => {
  if (!response.ok) {
    return false;
  }

  const cacheControl = response.headers.get("Cache-Control") ?? "";
  if (/no-store|private/i.test(cacheControl)) {
    return false;
  }

  if (response.headers.has("Set-Cookie")) {
    return false;
  }

  const hasLifetime = /(s-maxage|max-age)=\d+/i.test(cacheControl);
  const isPublic = /(^|,)\s*public\b/i.test(cacheControl);

  return hasLifetime && isPublic;
};

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  const url = new URL(request.url);
  if (shouldSkipPath(url.pathname)) {
    return next();
  }

  const accept = request.headers.get("Accept") ?? "";
  if (!accept.includes("text/html")) {
    return next();
  }

  if (hasAuthHeaders(request)) {
    return next();
  }

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await next();
  const responseWithCache = new Response(response.body, response);

  const existingCacheControl =
    responseWithCache.headers.get("Cache-Control") ?? "";
  if (!/no-store|private/i.test(existingCacheControl)) {
    responseWithCache.headers.set(
      "Cache-Control",
      DEFAULT_SSR_CACHE_CONTROL
    );
  }

  if (!isCacheableResponse(responseWithCache)) {
    return responseWithCache;
  }

  context.waitUntil(cache.put(cacheKey, responseWithCache.clone()));
  return responseWithCache;
};
