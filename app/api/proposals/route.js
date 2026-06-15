import { NextResponse } from "next/server";
import { buildProposal } from "@/lib/proposal";
import { createCloserTask, createFundaeOpportunity, appendLeadNote } from "@/lib/twenty";

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

    return NextResponse.json({ ok: true, proposal, crm });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
