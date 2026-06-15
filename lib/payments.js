import { notifyAccountingPaymentReceived } from "./accounting";
import { checkHoldedPaymentStatus } from "./holded";
import { appendLeadNote } from "./twenty";
import { findProposalRecord, markAccountingNotified, recordPaymentCheck } from "./store";

export async function syncProposalPayment({ lead = {}, proposal, proformaId }) {
  if (!proposal?.id) throw new Error("Proposal is required");
  if (!proformaId) throw new Error("proformaId is required");

  const status = await checkHoldedPaymentStatus(proformaId);
  let record = await recordPaymentCheck({ lead, proposal, proformaId, status });
  let accounting = { ok: true, skipped: true, reason: "Proforma no marcada como pagada" };

  if (status.paid) {
    const previous = await findProposalRecord(proposal.id);
    if (previous?.paymentNotifiedAt) {
      accounting = {
        ok: true,
        skipped: true,
        reason: "Contabilidad ya avisada",
        notifiedAt: previous.paymentNotifiedAt,
      };
    } else {
      accounting = await notifyAccountingPaymentReceived({ lead, proposal, proformaId, status });
      record = await markAccountingNotified({ proposalId: proposal.id, accounting });
    }

    await appendLeadNote({
      lead: lead || { id: proposal.leadId },
      text: `Pago detectado en Holded para proforma ${proformaId}. Contabilidad: ${accounting.skipped ? accounting.reason : accounting.mode}`,
    });
  }

  return { status, accounting, record };
}
