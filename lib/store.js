import { promises as fs } from "fs";
import path from "path";

const STORE_VERSION = 1;
const STORE_FILE = "data/sales-backend.json";

function getStorePath() {
  return STORE_FILE;
}

function emptyStore() {
  return {
    version: STORE_VERSION,
    proposals: [],
    paymentChecks: [],
  };
}

function nowIso() {
  return new Date().toISOString();
}

async function readStore() {
  try {
    const raw = await fs.readFile(getStorePath(), "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...emptyStore(),
      ...parsed,
      proposals: Array.isArray(parsed.proposals) ? parsed.proposals : [],
      paymentChecks: Array.isArray(parsed.paymentChecks) ? parsed.paymentChecks : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") return emptyStore();
    throw error;
  }
}

async function writeStore(store) {
  const file = getStorePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await fs.rename(tmp, file);
  return store;
}

function proposalSnapshot(proposal, fallback = {}) {
  return {
    id: proposal.id || fallback.id,
    status: proposal.status || fallback.status || "draft",
    title: proposal.title || fallback.title || "",
    companyName: proposal.companyName || fallback.companyName || "",
    contactName: proposal.contactName || fallback.contactName || "",
    email: proposal.email || fallback.email || "",
    employeeCount: proposal.employeeCount || fallback.employeeCount || 1,
    totals: proposal.totals || fallback.totals || { amount: 0, hours: 0 },
    courses: Array.isArray(proposal.courses) ? proposal.courses : fallback.courses || [],
    creditApplied: proposal.creditApplied ?? fallback.creditApplied ?? 0,
    notCoveredByCredit: proposal.notCoveredByCredit ?? fallback.notCoveredByCredit ?? 0,
    minimumPrivateContribution: proposal.minimumPrivateContribution ?? fallback.minimumPrivateContribution ?? 0,
    summary: proposal.summary || fallback.summary || "",
    createdAt: proposal.createdAt || fallback.createdAt || nowIso(),
  };
}

function leadSnapshot(lead = {}, fallback = {}) {
  return {
    id: lead.id || fallback.id || "",
    companyName: lead.companyName || lead.empresa || fallback.companyName || "",
    contactName: lead.contactName || lead.nombre || fallback.contactName || "",
    email: lead.email || fallback.email || "",
    phone: lead.phone || lead.telefono || fallback.phone || "",
    sectorLabel: lead.sectorLabel || lead.sector || fallback.sectorLabel || "",
    employeeCount: Number(lead.employeeCount || lead.empleados || fallback.employeeCount || 1),
    leadPriority: lead.leadPriority || fallback.leadPriority || "warm",
    leadScore: Number(lead.leadScore || fallback.leadScore || 50),
    owner: lead.owner || fallback.owner || "Sin asignar",
  };
}

function addEvent(record, event) {
  return {
    ...record,
    events: [
      ...(record.events || []),
      {
        at: nowIso(),
        ...event,
      },
    ].slice(-60),
  };
}

export async function listProposalRecords({ limit = 100, paymentStatus } = {}) {
  const store = await readStore();
  return store.proposals
    .filter((record) => !paymentStatus || record.paymentStatus === paymentStatus)
    .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
    .slice(0, limit);
}

export async function findProposalRecord(proposalId) {
  if (!proposalId) return null;
  const store = await readStore();
  return store.proposals.find((record) => record.id === proposalId) || null;
}

export async function saveProposalRecord({ lead = {}, proposal, crm = null }) {
  if (!proposal?.id) throw new Error("Proposal id is required");

  const store = await readStore();
  const index = store.proposals.findIndex((record) => record.id === proposal.id);
  const current = index >= 0 ? store.proposals[index] : {};
  const timestamp = nowIso();
  const nextRecord = addEvent({
    ...current,
    id: proposal.id,
    leadId: proposal.leadId || lead.id || current.leadId || "",
    companyName: proposal.companyName || lead.companyName || current.companyName || "",
    contactName: proposal.contactName || lead.contactName || current.contactName || "",
    email: proposal.email || lead.email || current.email || "",
    status: proposal.status || current.status || "draft",
    paymentStatus: current.paymentStatus || "pending",
    paidAt: current.paidAt || null,
    paymentNotifiedAt: current.paymentNotifiedAt || null,
    holded: current.holded || null,
    crm: crm || current.crm || null,
    proposal: proposalSnapshot(proposal, current.proposal),
    lead: leadSnapshot(lead, current.lead),
    createdAt: current.createdAt || proposal.createdAt || timestamp,
    updatedAt: timestamp,
  }, {
    type: "proposal_saved",
    summary: proposal.summary || "",
  });

  if (index >= 0) store.proposals[index] = nextRecord;
  else store.proposals.unshift(nextRecord);

  await writeStore(store);
  return nextRecord;
}

export async function updateProposalStatus({ proposalId, status }) {
  const allowed = new Set(["draft", "sent", "accepted", "lost"]);
  if (!allowed.has(status)) throw new Error("Invalid proposal status");

  const store = await readStore();
  const index = store.proposals.findIndex((record) => record.id === proposalId);
  if (index < 0) throw new Error("Proposal not found");

  const current = store.proposals[index];
  const nextRecord = addEvent({
    ...current,
    status,
    proposal: {
      ...current.proposal,
      status,
    },
    updatedAt: nowIso(),
  }, {
    type: "proposal_status_changed",
    status,
  });

  store.proposals[index] = nextRecord;
  await writeStore(store);
  return nextRecord;
}

export async function attachHoldedProforma({ lead = {}, proposal, holded }) {
  const saved = await saveProposalRecord({ lead, proposal });
  const store = await readStore();
  const index = store.proposals.findIndex((record) => record.id === saved.id);
  const current = store.proposals[index];
  const nextRecord = addEvent({
    ...current,
    holded: {
      mode: holded.mode,
      contactId: holded.contactId || "",
      proformaId: holded.proformaId || "",
      status: holded.status || "draft",
      downloadUrl: holded.proformaId ? `/api/holded/proforma/${holded.proformaId}/download` : null,
      createdAt: nowIso(),
    },
    updatedAt: nowIso(),
  }, {
    type: "holded_proforma_created",
    proformaId: holded.proformaId || "",
    mode: holded.mode || "",
  });

  store.proposals[index] = nextRecord;
  await writeStore(store);
  return nextRecord;
}

export async function recordPaymentCheck({ lead = {}, proposal, proformaId, status }) {
  const saved = await saveProposalRecord({ lead, proposal });
  const store = await readStore();
  const index = store.proposals.findIndex((record) => record.id === saved.id);
  const current = store.proposals[index];
  const paid = Boolean(status?.paid);
  const paymentStatus = paid ? "paid" : status?.status ? "pending" : "unknown";
  const check = {
    at: nowIso(),
    proposalId: proposal.id,
    proformaId,
    mode: status?.mode || "unknown",
    paid,
    status: status?.status || "",
  };
  const nextRecord = addEvent({
    ...current,
    paymentStatus,
    paidAt: paid ? current.paidAt || check.at : current.paidAt || null,
    holded: {
      ...(current.holded || {}),
      proformaId: proformaId || current.holded?.proformaId || "",
      status: status?.status || current.holded?.status || "",
      lastCheckedAt: check.at,
    },
    updatedAt: check.at,
  }, {
    type: "payment_checked",
    proformaId,
    paymentStatus,
    rawStatus: status?.status || "",
  });

  store.proposals[index] = nextRecord;
  store.paymentChecks.unshift(check);
  store.paymentChecks = store.paymentChecks.slice(0, 500);
  await writeStore(store);
  return nextRecord;
}

export async function markAccountingNotified({ proposalId, accounting }) {
  const store = await readStore();
  const index = store.proposals.findIndex((record) => record.id === proposalId);
  if (index < 0) throw new Error("Proposal not found");

  const notifiedAt = nowIso();
  const current = store.proposals[index];
  const nextRecord = addEvent({
    ...current,
    paymentNotifiedAt: current.paymentNotifiedAt || notifiedAt,
    accountingNotification: accounting,
    updatedAt: notifiedAt,
  }, {
    type: "accounting_notified",
    mode: accounting?.mode || "",
    to: accounting?.to || "",
  });

  store.proposals[index] = nextRecord;
  await writeStore(store);
  return nextRecord;
}
