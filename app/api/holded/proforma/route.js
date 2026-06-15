import { NextResponse } from "next/server";
import { buildProposal } from "@/lib/proposal";
import { createHoldedProforma } from "@/lib/holded";
import { appendLeadNote } from "@/lib/twenty";

export async function POST(request) {
  try {
    const body = await request.json();
    const proposal = body.proposal || buildProposal(body);
    const holded = await createHoldedProforma(proposal);
    await appendLeadNote({
      lead: body.lead || { id: proposal.leadId },
      text: `Proforma Holded ${holded.proformaId} creada para ${proposal.summary}`,
    });

    return NextResponse.json({
      ok: true,
      proposal,
      holded,
      downloadUrl: holded.proformaId ? `/api/holded/proforma/${holded.proformaId}/download` : null,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
