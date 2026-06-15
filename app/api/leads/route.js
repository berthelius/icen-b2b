import { NextResponse } from "next/server";
import { listSalesLeads } from "@/lib/twenty";

export async function GET() {
  try {
    const data = await listSalesLeads();
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      source: "error",
      leads: [],
    }, { status: 500 });
  }
}
