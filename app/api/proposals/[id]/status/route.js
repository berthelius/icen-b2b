import { NextResponse } from "next/server";
import { updateProposalStatus } from "@/lib/store";
import { appendLeadNote } from "@/lib/twenty";

const statusLabels = {
  draft: "borrador",
  sent: "enviada",
  accepted: "aceptada",
  lost: "perdida",
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const record = await updateProposalStatus({ proposalId: id, status: body.status });

    await appendLeadNote({
      lead: record.lead || { id: record.leadId },
      text: `Estado propuesta FUNDAE: ${statusLabels[body.status] || body.status}`,
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
