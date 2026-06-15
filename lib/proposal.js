import { calculateFundaeCredit, formatCurrency } from "./fundae";
import { courseById, recommendCourses } from "./catalog";

export const proposalStatuses = ["draft", "sent", "accepted", "lost"];

export function buildProposal(input) {
  const lead = input.lead || {};
  const employeeCount = Number(input.employeeCount ?? lead.employeeCount ?? lead.empleados ?? 1);
  const payroll = Number(input.payroll || 0);
  const selectedCourseIds = input.courseIds?.length
    ? input.courseIds
    : recommendCourses({
      sectorFamily: lead.sectorFamily,
      employeeCount,
      requestedCourseSlug: lead.requestedCourseSlug,
    }).slice(0, 3).map((course) => course.id);

  const selectedCourses = selectedCourseIds
    .map((id) => courseById.get(id))
    .filter(Boolean);
  const totals = selectedCourses.reduce((acc, course) => ({
    hours: acc.hours + course.hours,
    amount: acc.amount + course.price,
  }), { hours: 0, amount: 0 });
  const fundae = calculateFundaeCredit(employeeCount, payroll || undefined);
  const creditApplied = Math.min(fundae.credit, totals.amount);
  const notCoveredByCredit = Math.max(totals.amount - creditApplied, 0);
  const minimumPrivateContribution = Math.round(totals.amount * fundae.cofinancingRate);

  return {
    id: input.id || `prop-${Date.now()}`,
    status: input.status || "draft",
    createdAt: input.createdAt || new Date().toISOString(),
    leadId: lead.id,
    companyName: lead.companyName || lead.empresa || "",
    contactName: lead.contactName || lead.nombre || "",
    email: lead.email || "",
    employeeCount,
    payroll: fundae.payroll,
    fundae,
    courses: selectedCourses,
    totals,
    creditApplied,
    notCoveredByCredit,
    minimumPrivateContribution,
    title: input.title || `Propuesta FUNDAE para ${lead.companyName || lead.empresa || "empresa"}`,
    notes: input.notes || "Cálculo orientativo pendiente de validar con crédito real FUNDAE y cuota de formación profesional del año anterior.",
    summary: [
      `${selectedCourses.length} módulos`,
      `${totals.hours} h declarables`,
      `${formatCurrency(totals.amount)} de coste formativo`,
      `${formatCurrency(creditApplied)} cubiertos por crédito estimado`,
    ].join(" · "),
  };
}

export function proposalToHoldedPayload(proposal) {
  return {
    contact: {
      name: proposal.companyName,
      email: proposal.email,
      contactName: proposal.contactName,
    },
    proforma: {
      date: new Date().toISOString().slice(0, 10),
      description: proposal.title,
      notes: proposal.notes,
      lines: proposal.courses.map((course) => ({
        name: course.title,
        desc: `${course.master} · ${course.hours} h teleformación FUNDAE`,
        units: 1,
        subtotal: course.price,
        tax: 0,
      })),
      total: proposal.totals.amount,
      metadata: {
        proposalId: proposal.id,
        leadId: proposal.leadId,
        fundaeCredit: proposal.fundae.credit,
      },
    },
  };
}

export function proposalHtml(proposal) {
  const rows = proposal.courses.map((course) => `
    <tr>
      <td>${escapeHtml(course.title)}</td>
      <td>${escapeHtml(course.master)}</td>
      <td>${course.hours} h</td>
      <td>${formatCurrency(course.price)}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(proposal.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #102033; margin: 36px; line-height: 1.5; }
    h1 { color: #063b75; margin-bottom: 4px; }
    .muted { color: #667085; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .box { border: 1px solid #d9e2ec; padding: 12px; border-radius: 6px; }
    .label { font-size: 11px; color: #667085; text-transform: uppercase; letter-spacing: .08em; }
    .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border-bottom: 1px solid #e5e7eb; text-align: left; padding: 10px; font-size: 13px; }
    th { background: #f8fafc; }
    .note { background: #fff7ed; border: 1px solid #fed7aa; padding: 14px; border-radius: 6px; margin-top: 24px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(proposal.title)}</h1>
  <p class="muted">${escapeHtml(proposal.companyName)} · ${proposal.employeeCount} empleados · ${escapeHtml(proposal.contactName)}</p>
  <div class="summary">
    <div class="box"><div class="label">Crédito estimado</div><div class="value">${formatCurrency(proposal.fundae.credit)}</div></div>
    <div class="box"><div class="label">Coste formativo</div><div class="value">${formatCurrency(proposal.totals.amount)}</div></div>
    <div class="box"><div class="label">Crédito aplicado</div><div class="value">${formatCurrency(proposal.creditApplied)}</div></div>
    <div class="box"><div class="label">Cofinanciación mínima</div><div class="value">${formatCurrency(proposal.minimumPrivateContribution)}</div></div>
  </div>
  <table>
    <thead><tr><th>Módulo</th><th>Área</th><th>Horas</th><th>Importe</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="note">
    <strong>Nota FUNDAE.</strong> Esta propuesta es orientativa. El crédito real debe validarse con la cuota de formación profesional ingresada el año anterior, los límites de coste y los requisitos de comunicación, participación y documentación.
  </div>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
