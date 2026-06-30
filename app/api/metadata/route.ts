import { NextRequest, NextResponse } from "next/server";
import { fetchMetadata } from "@/lib/link-parsers";
import { isValidHttpUrl } from "@/lib/link-parsers/detect";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isValidHttpUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  try {
    const result = await fetchMetadata(url);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({
      title: null,
      url,
      platform: "generic",
      error: e instanceof Error ? e.message : "Fetch failed",
    });
  }
}
