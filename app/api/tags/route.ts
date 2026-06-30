import { NextResponse } from "next/server";
import { createTag, listAllTags } from "@/lib/tasks";

export async function GET() {
  return NextResponse.json({ tags: await listAllTags() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string };
  const result = await createTag(body.name ?? "");
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ tag: result });
}
