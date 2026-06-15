export async function sendClientPaymentEmail({ to, proposal, proformaId }) {
  const webhook = process.env.ICEN_EMAIL_WEBHOOK_URL || "https://n8n.icen.es/webhook/icen-email-send";

  if (!process.env.ICEN_EMAIL_WEBHOOK_URL) {
    return { ok: true, mode: "dry-run", reason: "ICEN_EMAIL_WEBHOOK_URL no configurado" };
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject: `Confirmación de formación FUNDAE · ${proposal.companyName}`,
      from: "ICEN Empresas <info@icen.es>",
      html: `<p>Hola ${proposal.contactName || ""},</p>
        <p>Hemos recibido el pago de la propuesta FUNDAE <strong>${proposal.title}</strong>.</p>
        <p>El equipo de ICEN se pondrá en marcha con la documentación y próximos pasos.</p>
        <p>Referencia proforma: ${proformaId}</p>`,
    }),
  });

  if (!res.ok) throw new Error(`Email webhook failed: ${res.status}`);
  return { ok: true, mode: "email-webhook" };
}
