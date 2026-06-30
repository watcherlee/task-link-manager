import { NextResponse } from "next/server";
import { listArchived } from "@/lib/tasks";

export async function GET() {
  return NextResponse.json({ tasks: await listArchived() });
}
