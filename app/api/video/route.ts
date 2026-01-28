import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  const fwdHeaders = new Headers();
  const range = req.headers.get("range");
  if (range) fwdHeaders.set("range", range);

  // Forward CloudFront signed cookies
  const cookie = req.headers.get("cookie");
  if (cookie) fwdHeaders.set("cookie", cookie);

  const origin = req.headers.get("origin");
  if (origin) fwdHeaders.set("origin", origin);

  const upstream = await fetch(url, { headers: fwdHeaders });

  // Pass through important headers
  const respHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    const keep = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "etag",
      "last-modified",
      "cache-control",
    ];
    if (keep.includes(k.toLowerCase())) respHeaders.set(k, v);
  }

  console.log("Forwarding video request:", {
    url,
    headers: Object.fromEntries(fwdHeaders.entries()),
  });

  console.log("Upstream response status:", upstream.status);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}
