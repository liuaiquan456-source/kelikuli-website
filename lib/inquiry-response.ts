export async function readInquiryResponse(
  response: Response,
  fallback: string,
): Promise<Record<string, unknown>> {
  // A reverse proxy can reject an upload before it reaches Next.js and return
  // HTML (for example, nginx's 413 page), so JSON is not guaranteed here.
  const body: unknown = await response.json().catch(() => null);
  const data =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;

  if (response.status === 413)
    throw new Error(
      "The server could not accept this upload because it is too large. Choose a smaller file, or remove the attachment and send your inquiry without it.",
    );
  if (!response.ok)
    throw new Error(
      typeof data?.error === "string" && data.error.trim()
        ? data.error
        : fallback,
    );
  if (!data) throw new Error(fallback);
  return data;
}
