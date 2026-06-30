import { NextRequest, NextResponse } from "next/server";
import { searchTasks } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const tag = req.nextUrl.searchParams.get("tag") ?? undefined;
  const includeArchived =
    req.nextUrl.searchParams.get("includeArchived") !== "0";
  const tasks = await searchTasks({ q, tag, includeArchived });
  return NextResponse.json({ tasks });
}
