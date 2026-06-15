import { NextResponse } from "next/server";
import { syncProposalPayment } from "@/lib/payments";
import { listProposalRecords } from "@/lib/store";

export async function GET(request) {
  return runPaymentMonitor(request);
}

export async function POST(request) {
  return runPaymentMonitor(request);
}

async function runPaymentMonitor(request) {
  try {
    if (!hasValidMonitorToken(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") || 25);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 25;
    const records = await listProposalRecords({ limit: 250 });
    const pending = records
      .filter((record) => record.holded?.proformaId)
      .filter((record) => record.paymentStatus !== "paid")
      .filter((record) => record.holded?.mode !== "dry-run")
      .slice(0, limit);
    const results = [];

    for (const record of pending) {
      try {
        const result = await syncProposalPayment({
          lead: record.lead,
          proposal: {
            ...record.proposal,
            id: record.id,
            leadId: record.leadId,
            status: record.status,
          },
          proformaId: record.holded.proformaId,
        });

        results.push({
          proposalId: record.id,
          proformaId: record.holded.proformaId,
          paid: result.status.paid,
          accounting: result.accounting,
        });
      } catch (error) {
        results.push({
          proposalId: record.id,
          proformaId: record.holded.proformaId,
          ok: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      checked: results.length,
      paid: results.filter((result) => result.paid).length,
      accountingNotices: results.filter((result) => result.accounting && !result.accounting.skipped).length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

function hasValidMonitorToken(request) {
  const expected = process.env.ICEN_PAYMENT_MONITOR_TOKEN;
  if (!expected) return true;

  const url = new URL(request.url);
  const provided = request.headers.get("x-icen-monitor-token") || url.searchParams.get("token");
  return provided === expected;
}
