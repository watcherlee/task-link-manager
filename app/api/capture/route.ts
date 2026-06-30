import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/tasks";
import { fetchMetadata } from "@/lib/link-parsers";
import { isValidHttpUrl } from "@/lib/link-parsers/detect";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url as string | undefined;
    let title = (body.title as string | undefined)?.trim() ?? "";
    const kind = body.kind === "task" ? "task" : "bookmark";

    if (!url || !isValidHttpUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400, headers: corsHeaders },
      );
    }

    let platform = body.platform ?? null;
    if (!title) {
      const meta = await fetchMetadata(url);
      title = meta.title ?? new URL(url).hostname;
      platform = meta.platform;
    }

    const task = await createTask({
      title,
      url,
      platform,
      kind,
      tagNames: body.tagNames,
      notes: body.notes,
    });

    return NextResponse.json(
      { task, ok: true },
      { status: 201, headers: corsHeaders },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Capture failed" },
      { status: 400, headers: corsHeaders },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
