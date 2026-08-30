/** Base URL of the Cloudflare Pages site serving notices/terms/news — the
 *  low-churn WebView content that shouldn't require an app store resubmission
 *  to update. Defaults to the local dev server for `npm run dev` in cloudflare/pages. */
export const CONTENT_BASE_URL = process.env.EXPO_PUBLIC_CONTENT_BASE_URL ?? 'http://localhost:8788';

export function contentUrlForSlug(slug: string) {
  return `${CONTENT_BASE_URL.replace(/\/$/, '')}/${slug.replace(/^\//, '')}`;
}
