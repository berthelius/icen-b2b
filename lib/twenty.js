import { demoLeads } from "./demo-data";

const DEFAULT_TWENTY_BASE_URL = "https://crm.icen.es";

function twentyConfig() {
  return {
    baseUrl: process.env.TWENTY_BASE_URL || DEFAULT_TWENTY_BASE_URL,
    apiKey: process.env.TWENTY_API_KEY || "",
  };
}

function twentyHeaders() {
  const { apiKey } = twentyConfig();
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };
}

export function hasTwentyConfig() {
  return Boolean(twentyConfig().apiKey);
}

export async function listSalesLeads() {
  if (!hasTwentyConfig()) {
    return { source: "demo", leads: demoLeads };
  }

  const { baseUrl } = twentyConfig();
  const url = `${baseUrl.replace(/\/$/, "")}/rest/people?limit=50&orderBy=createdAt%5BDesc%5D`;
  const res = await fetch(url, { headers: twentyHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`Twenty list people failed: ${res.status}`);
  const payload = await res.json();
  const rawPeople = Array.isArray(payload.data) ? payload.data : Array.isArray(payload.people) ? payload.people : [];

  return {
    source: "twenty",
    leads: rawPeople.map(mapTwentyPersonToLead),
  };
}

export async function createFundaeOpportunity({ lead, proposal }) {
  if (!hasTwentyConfig()) {
    return { ok: true, mode: "dry-run", id: `dry-opp-${proposal.id}` };
  }

  const { baseUrl } = twentyConfig();
  const body = {
    name: `FUNDAE · ${proposal.companyName}`,
    amount: proposal.totals.amount,
    closeDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    stage: "NEW",
    source: "empresas-icen",
    notes: proposal.summary,
    personId: lead.id?.startsWith("lead-") ? undefined : lead.id,
  };
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/opportunities`, {
    method: "POST",
    headers: twentyHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Twenty create opportunity failed: ${res.status}`);
  return { ok: true, mode: "twenty", data: await res.json() };
}

export async function createCloserTask({ lead, proposal, dueHours = 24 }) {
  if (!hasTwentyConfig()) {
    return { ok: true, mode: "dry-run", id: `dry-task-${proposal.id}` };
  }

  const { baseUrl } = twentyConfig();
  const dueAt = new Date(Date.now() + dueHours * 3600000).toISOString();
  const body = {
    title: `Enviar propuesta FUNDAE · ${proposal.companyName}`,
    dueAt,
    status: "TODO",
    body: proposal.summary,
    assignee: lead.owner && lead.owner !== "Sin asignar" ? lead.owner : undefined,
  };
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/tasks`, {
    method: "POST",
    headers: twentyHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Twenty create task failed: ${res.status}`);
  return { ok: true, mode: "twenty", data: await res.json() };
}

export async function appendLeadNote({ lead, text }) {
  if (!hasTwentyConfig()) {
    return { ok: true, mode: "dry-run" };
  }

  const { baseUrl } = twentyConfig();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/notes`, {
    method: "POST",
    headers: twentyHeaders(),
    body: JSON.stringify({
      title: "Propuesta FUNDAE",
      body: text,
      targetObjectName: "person",
      targetObjectRecordId: lead.id,
    }),
  });
  if (!res.ok) throw new Error(`Twenty append note failed: ${res.status}`);
  return { ok: true, mode: "twenty", data: await res.json() };
}

function mapTwentyPersonToLead(person) {
  const firstName = person.name?.firstName || "";
  const lastName = person.name?.lastName || "";
  const email = person.emails?.primaryEmail || person.email || "";
  const phone = person.phones?.primaryPhoneNumber || person.phone || "";
  const companyName = person.company?.name || person.empresa || "Empresa sin nombre";

  return {
    id: person.id,
    companyName,
    contactName: `${firstName} ${lastName}`.trim() || person.name || "Contacto",
    email,
    phone,
    sectorLabel: person.sectorLabel || person.sector || "Sin sector",
    sectorFamily: person.sectorFamily || "",
    employeeCount: Number(person.employeeCount || person.empleados || 1),
    employeeBand: person.employeeBand || "",
    leadPriority: person.leadPriority || person.leadScore || "warm",
    leadScore: Number(person.leadScoreNumber || 50),
    estimatedCredit: Number(person.estimatedCredit || 0),
    requestedCourseSlug: person.requestedCourseSlug || person.programaDeInteres || "",
    closerBrief: person.closerBrief || "",
    trackingParams: {},
    stage: person.estadoComercial || "nuevo",
    owner: person.asesorAAcademica || "Sin asignar",
    nextActionAt: person.nextActionAt || "",
    createdAt: person.createdAt || new Date().toISOString(),
  };
}
