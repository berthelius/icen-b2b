import { proposalToHoldedPayload } from "./proposal";

const DEFAULT_HOLDED_BASE_URL = "https://api.holded.com";

function holdedConfig() {
  return {
    baseUrl: process.env.HOLDED_BASE_URL || DEFAULT_HOLDED_BASE_URL,
    apiKey: process.env.HOLDED_API_KEY || "",
  };
}

function holdedHeaders() {
  const { apiKey } = holdedConfig();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };
}

export function hasHoldedConfig() {
  return Boolean(holdedConfig().apiKey);
}

export async function createHoldedProforma(proposal) {
  const holdedPayload = proposalToHoldedPayload(proposal);

  if (!hasHoldedConfig()) {
    return {
      ok: true,
      mode: "dry-run",
      contactId: `dry-contact-${proposal.id}`,
      proformaId: `dry-proforma-${proposal.id}`,
      status: "draft",
      payload: holdedPayload,
    };
  }

  const contact = await createOrFindContact(holdedPayload.contact);
  const proforma = await createProformaDocument({
    ...holdedPayload.proforma,
    contactId: contact.id || contact.data?.id,
  });

  return {
    ok: true,
    mode: "holded",
    contactId: contact.id || contact.data?.id,
    proformaId: proforma.id || proforma.data?.id,
    status: proforma.status || "draft",
    data: proforma,
  };
}

export async function getHoldedProformaPdf(proformaId) {
  if (!hasHoldedConfig()) {
    return {
      ok: false,
      mode: "dry-run",
      reason: "HOLDED_API_KEY no configurado. Usa la descarga HTML local de propuesta.",
    };
  }

  const { baseUrl } = holdedConfig();
  const res = await fetch(`${baseUrl}/api/v2/proformas/${encodeURIComponent(proformaId)}/pdf`, {
    headers: holdedHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Holded get proforma PDF failed: ${res.status}`);
  return {
    ok: true,
    mode: "holded",
    contentType: res.headers.get("content-type") || "application/pdf",
    body: await res.arrayBuffer(),
  };
}

export async function checkHoldedPaymentStatus(proformaId) {
  if (!hasHoldedConfig()) {
    return { ok: true, mode: "dry-run", paid: false, status: "pending" };
  }

  const { baseUrl } = holdedConfig();
  const res = await fetch(`${baseUrl}/api/v2/proformas/${encodeURIComponent(proformaId)}`, {
    headers: holdedHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Holded get proforma failed: ${res.status}`);
  const data = await res.json();
  const payment = detectPaymentStatus(data);
  const status = payment.status || "unknown";
  const paid = payment.paid;
  return { ok: true, mode: "holded", paid, status, data };
}

async function createOrFindContact(contact) {
  const { baseUrl } = holdedConfig();
  const body = {
    name: contact.name,
    email: contact.email,
    contactPerson: contact.contactName,
    type: "client",
  };
  const res = await fetch(`${baseUrl}/api/v2/contacts`, {
    method: "POST",
    headers: holdedHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Holded create contact failed: ${res.status}`);
  return res.json();
}

async function createProformaDocument(proforma) {
  const { baseUrl } = holdedConfig();
  const body = {
    contactId: proforma.contactId,
    date: proforma.date,
    description: proforma.description,
    notes: proforma.notes,
    lines: proforma.lines,
    customFields: proforma.metadata,
  };
  const res = await fetch(`${baseUrl}/api/v2/proformas`, {
    method: "POST",
    headers: holdedHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Holded create proforma failed: ${res.status}`);
  return res.json();
}

function detectPaymentStatus(data) {
  const document = data?.data || data || {};
  const statusValues = [
    document.status,
    document.state,
    document.paymentStatus,
    document.payment?.status,
    document.pipelineStage,
  ].filter(Boolean).map((value) => String(value).toLowerCase());
  const paidStatuses = new Set([
    "paid",
    "charged",
    "collected",
    "settled",
    "completed",
    "complete",
    "pagada",
    "pagado",
    "cobrado",
    "cobrada",
  ]);
  const unpaidStatuses = new Set(["pending", "draft", "open", "unpaid", "overdue", "pendiente", "borrador"]);
  const status = statusValues[0] || "";

  if (statusValues.some((value) => paidStatuses.has(value))) {
    return { paid: true, status };
  }

  const paidSignal = document.paid === true || document.isPaid === true || Boolean(document.paidAt || document.datePaid);
  if (paidSignal) {
    return { paid: true, status: status || "paid" };
  }

  const total = toNumber(document.total ?? document.totalAmount ?? document.amount);
  const paidAmount = toNumber(
    document.paidAmount ??
    document.amountPaid ??
    document.collectedAmount ??
    document.paymentsTotal ??
    document.payment?.amount,
  );
  const payments = Array.isArray(document.payments) ? document.payments : [];
  const paymentsTotal = payments.reduce((sum, payment) => sum + toNumber(payment.amount ?? payment.total), 0);

  if (total > 0 && Math.max(paidAmount, paymentsTotal) >= total) {
    return { paid: true, status: status || "paid" };
  }

  if (statusValues.some((value) => unpaidStatuses.has(value))) {
    return { paid: false, status };
  }

  return { paid: false, status };
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}
