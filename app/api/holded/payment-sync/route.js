import { NextResponse } from "next/server";
import { buildProposal } from "@/lib/proposal";
import { syncProposalPayment } from "@/lib/payments";

export async function POST(request) {
  try {
    const body = await request.json();
    const proposal = body.proposal || buildProposal(body);
    const result = await syncProposalPayment({
      lead: body.lead || { id: proposal.leadId },
      proposal,
      proformaId: body.proformaId,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
