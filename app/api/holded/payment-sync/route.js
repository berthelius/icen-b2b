import { NextResponse } from "next/server";
import { checkHoldedPaymentStatus } from "@/lib/holded";
import { buildProposal } from "@/lib/proposal";
import { sendClientPaymentEmail } from "@/lib/email";
import { appendLeadNote } from "@/lib/twenty";

export async function POST(request) {
  try {
    const body = await request.json();
    const proposal = body.proposal || buildProposal(body);
    const status = await checkHoldedPaymentStatus(body.proformaId);
    const email = status.paid
      ? await sendClientPaymentEmail({
        to: proposal.email,
        proposal,
        proformaId: body.proformaId,
      })
      : { ok: true, skipped: true, reason: "Proforma no marcada como pagada" };

    if (status.paid) {
      await appendLeadNote({
        lead: body.lead || { id: proposal.leadId },
        text: `Pago detectado en Holded para proforma ${body.proformaId}. Email cliente: ${email.mode}`,
      });
    }

    return NextResponse.json({ ok: true, status, email });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
