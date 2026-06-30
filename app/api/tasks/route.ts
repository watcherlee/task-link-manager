import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks, listAllTags } from "@/lib/tasks";
import type { Stage } from "@/lib/types";

export async function GET(req: NextRequest) {
  const stage = req.nextUrl.searchParams.get("stage") as Stage | null;
  const tasks = await listTasks(stage ?? undefined);
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = await createTask({
      title: body.title,
      kind: body.kind,
      url: body.url,
      platform: body.platform,
      notes: body.notes,
      stage: body.stage,
      tagNames: body.tagNames,
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Create failed" },
      { status: 400 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
