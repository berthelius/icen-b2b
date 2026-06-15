import { NextResponse } from "next/server";
import { buildProposal } from "@/lib/proposal";
import { createCloserTask, createFundaeOpportunity, appendLeadNote } from "@/lib/twenty";
import { listProposalRecords, saveProposalRecord } from "@/lib/store";

export async function GET() {
  try {
    const proposals = await listProposalRecords();
    return NextResponse.json({ ok: true, proposals });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const proposal = buildProposal(body);
    const shouldRegister = body.registerInCrm !== false;
    const crm = shouldRegister
      ? {
        opportunity: await createFundaeOpportunity({ lead: body.lead || {}, proposal }),
        task: await createCloserTask({
          lead: body.lead || {},
          proposal,
          dueHours: body.lead?.closerSlaHours || 24,
        }),
        note: await appendLeadNote({
          lead: body.lead || {},
          text: `Propuesta FUNDAE generada: ${proposal.summary}`,
        }),
      }
      : { skipped: true };
    const record = await saveProposalRecord({ lead: body.lead || {}, proposal, crm });

    return NextResponse.json({ ok: true, proposal, crm, record });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
