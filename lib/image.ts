const PRIVATE_BLOB_HOST = ".private.blob.vercel-storage.com";

export function getImageSrc(url?: string | null): string {
  if (!url) return "";
  if (url.includes(PRIVATE_BLOB_HOST)) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
