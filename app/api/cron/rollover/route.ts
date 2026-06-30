import { NextRequest, NextResponse } from "next/server";
import {
  runRolloverCompensation,
  runScheduledRollover,
} from "@/lib/rollover";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (
    process.env.CRON_SECRET &&
    secret !== process.env.CRON_SECRET &&
    bearer !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runScheduledRollover();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await runRolloverCompensation();
  return NextResponse.json(result);
}
