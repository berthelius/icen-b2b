import { formatCurrency } from "./fundae";

function accountingConfig() {
  return {
    webhook: process.env.ICEN_ACCOUNTING_WEBHOOK_URL || process.env.ICEN_EMAIL_WEBHOOK_URL || "",
    to: process.env.ICEN_ACCOUNTING_EMAIL || "contabilidad@icen.es",
    from: process.env.ICEN_EMAIL_FROM || "ICEN Empresas <info@icen.es>",
  };
}

export function hasAccountingNotifier() {
  return Boolean(accountingConfig().webhook);
}

export async function notifyAccountingPaymentReceived({ lead = {}, proposal, proformaId, status }) {
  const config = accountingConfig();

  if (!config.webhook) {
    return {
      ok: true,
      mode: "dry-run",
      skipped: true,
      to: config.to,
      reason: "ICEN_ACCOUNTING_WEBHOOK_URL o ICEN_EMAIL_WEBHOOK_URL no configurado",
    };
  }

  const subject = `Pago recibido FUNDAE · ${proposal.companyName}`;
  const html = paymentNoticeHtml({ lead, proposal, proformaId, status });
  const payload = {
    to: config.to,
    from: config.from,
    subject,
    html,
    category: "fundae-payment-received",
    metadata: {
      proposalId: proposal.id,
      leadId: proposal.leadId || lead.id || "",
      proformaId,
      companyName: proposal.companyName,
      amount: proposal.totals?.amount || 0,
      creditApplied: proposal.creditApplied || 0,
      paymentStatus: status?.status || "",
      paymentMode: status?.mode || "",
    },
  };

  const res = await fetch(config.webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Accounting webhook failed: ${res.status}`);
  return {
    ok: true,
    mode: process.env.ICEN_ACCOUNTING_WEBHOOK_URL ? "accounting-webhook" : "email-webhook",
    to: config.to,
  };
}

function paymentNoticeHtml({ lead, proposal, proformaId, status }) {
  const amount = formatCurrency(proposal.totals?.amount || 0);
  const credit = formatCurrency(proposal.creditApplied || 0);
  const privateAmount = formatCurrency(proposal.notCoveredByCredit || proposal.minimumPrivateContribution || 0);

  return `<p>Pago recibido para propuesta FUNDAE.</p>
    <ul>
      <li><strong>Empresa:</strong> ${escapeHtml(proposal.companyName)}</li>
      <li><strong>Contacto:</strong> ${escapeHtml(proposal.contactName || lead.contactName || "")}</li>
      <li><strong>Email:</strong> ${escapeHtml(proposal.email || lead.email || "")}</li>
      <li><strong>Propuesta:</strong> ${escapeHtml(proposal.id)}</li>
      <li><strong>Proforma Holded:</strong> ${escapeHtml(proformaId)}</li>
      <li><strong>Importe formativo:</strong> ${amount}</li>
      <li><strong>Credito aplicado:</strong> ${credit}</li>
      <li><strong>Aporte privado estimado:</strong> ${privateAmount}</li>
      <li><strong>Estado Holded:</strong> ${escapeHtml(status?.status || "paid")}</li>
    </ul>
    <p>Accion: validar cobro en Holded, emitir/regularizar factura segun procedimiento interno y coordinar documentacion FUNDAE con operaciones.</p>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
