"use client";

import { useEffect, useMemo, useState } from "react";
import { courses, recommendCourses } from "@/lib/catalog";
import { calculateFundaeCredit, formatCurrency } from "@/lib/fundae";
import { buildProposal } from "@/lib/proposal";

const stages = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "cualificado", label: "Cualificado" },
  { id: "propuesta", label: "Propuesta" },
  { id: "ganado", label: "Ganado" },
  { id: "perdido", label: "Perdido" },
];

export default function SalesBackend() {
  const [leads, setLeads] = useState([]);
  const [source, setSource] = useState("cargando");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(1);
  const [payroll, setPayroll] = useState("");
  const [proposal, setProposal] = useState(null);
  const [proforma, setProforma] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setLeads(data.leads || []);
        setSource(data.source || "desconocido");
        const first = data.leads?.[0];
        if (first) {
          setSelectedLeadId(first.id);
          setEmployeeCount(first.employeeCount || 1);
        }
      })
      .catch((error) => {
        if (!alive) return;
        setStatusMessage(`No se pudieron cargar leads: ${error.message}`);
        setSource("error");
      });
    return () => { alive = false; };
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || leads[0] || null,
    [leads, selectedLeadId],
  );

  useEffect(() => {
    if (!selectedLead) return;
    setEmployeeCount(selectedLead.employeeCount || 1);
    setPayroll("");
    setProposal(null);
    setProforma(null);
    const suggested = recommendCourses({
      sectorFamily: selectedLead.sectorFamily,
      employeeCount: selectedLead.employeeCount,
      requestedCourseSlug: selectedLead.requestedCourseSlug,
    }).slice(0, 3).map((course) => course.id);
    setSelectedCourseIds(suggested);
  }, [selectedLead]);

  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedCourseIds.includes(course.id)),
    [selectedCourseIds],
  );

  const localProposal = useMemo(() => {
    if (!selectedLead) return null;
    return buildProposal({
      lead: selectedLead,
      employeeCount: Number(employeeCount),
      payroll: Number(payroll || 0),
      courseIds: selectedCourseIds,
      status: proposal?.status || "draft",
    });
  }, [selectedLead, employeeCount, payroll, selectedCourseIds, proposal?.status]);

  const dashboard = useMemo(() => ({
    hot: leads.filter((lead) => lead.leadPriority === "hot").length,
    pending: leads.filter((lead) => !["ganado", "perdido"].includes(lead.stage)).length,
    needsContact: leads.filter((lead) => lead.stage === "nuevo").length,
    withProposal: leads.filter((lead) => lead.stage === "propuesta").length + (proposal ? 1 : 0),
  }), [leads, proposal]);

  function toggleCourse(courseId) {
    setSelectedCourseIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  }

  async function generateProposal() {
    if (!selectedLead) return;
    setBusyAction("proposal");
    setStatusMessage("");
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: selectedLead,
          employeeCount: Number(employeeCount),
          payroll: Number(payroll || 0),
          courseIds: selectedCourseIds,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al generar propuesta");
      setProposal(data.proposal);
      setStatusMessage(`Propuesta registrada: ${data.proposal.summary}`);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setBusyAction("");
    }
  }

  async function createProforma() {
    const activeProposal = proposal || localProposal;
    if (!activeProposal || !selectedLead) return;
    setBusyAction("holded");
    setStatusMessage("");
    try {
      const res = await fetch("/api/holded/proforma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: selectedLead, proposal: activeProposal }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al crear proforma");
      setProforma(data.holded);
      setProposal(data.proposal);
      setStatusMessage(data.holded.mode === "dry-run"
        ? "Proforma simulada. Configura HOLDED_API_KEY para crearla en Holded."
        : `Proforma Holded creada: ${data.holded.proformaId}`);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setBusyAction("");
    }
  }

  async function downloadProposal() {
    const activeProposal = proposal || localProposal;
    if (!activeProposal) return;
    setBusyAction("download");
    try {
      const res = await fetch("/api/proposals/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal: activeProposal }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeProposal.companyName || "icen"}-propuesta-fundae.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusyAction("");
    }
  }

  async function syncPayment() {
    const activeProposal = proposal || localProposal;
    if (!activeProposal || !proforma?.proformaId) return;
    setBusyAction("payment");
    setStatusMessage("");
    try {
      const res = await fetch("/api/holded/payment-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: selectedLead,
          proposal: activeProposal,
          proformaId: proforma.proformaId,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al sincronizar pago");
      setStatusMessage(data.status.paid
        ? "Pago detectado. Email enviado al cliente desde backend."
        : `Pago no detectado todavía (${data.status.status || "pendiente"}).`);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setBusyAction("");
    }
  }

  const fundae = localProposal?.fundae || calculateFundaeCredit(Number(employeeCount), Number(payroll || 0) || undefined);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ICEN B2B Backend</p>
          <h1>Ventas FUNDAE</h1>
        </div>
        <div className="topbar-actions">
          <span className={`source-pill ${source}`}>Datos: {source}</span>
          <a href="/strategy" className="ghost-link">Estrategia</a>
        </div>
      </header>

      <section className="metrics-grid" aria-label="Resumen comercial">
        <Metric label="Leads hot" value={dashboard.hot} tone="hot" />
        <Metric label="Pendientes" value={dashboard.pending} />
        <Metric label="Sin contactar" value={dashboard.needsContact} tone="warn" />
        <Metric label="Propuestas" value={dashboard.withProposal} tone="ok" />
      </section>

      <section className="workspace-grid">
        <aside className="lead-queue" aria-label="Cola de leads">
          <div className="section-head">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2>Leads para closers</h2>
            </div>
            <span>{leads.length}</span>
          </div>
          <div className="lead-list">
            {leads.map((lead) => (
              <button
                key={lead.id}
                className={`lead-row ${lead.id === selectedLead?.id ? "active" : ""}`}
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <span className={`priority-dot ${lead.leadPriority}`} />
                <span>
                  <strong>{lead.companyName}</strong>
                  <small>{lead.contactName} · {lead.employeeCount} emp · {lead.sectorLabel}</small>
                </span>
                <b>{lead.leadScore}</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="detail-panel">
          {selectedLead && (
            <>
              <div className="lead-header">
                <div>
                  <p className="eyebrow">Lead seleccionado</p>
                  <h2>{selectedLead.companyName}</h2>
                  <p>{selectedLead.contactName} · {selectedLead.email} · {selectedLead.phone || "sin teléfono"}</p>
                </div>
                <span className={`priority-badge ${selectedLead.leadPriority}`}>{selectedLead.leadPriority}</span>
              </div>

              <div className="stage-row">
                {stages.map((stage) => (
                  <button key={stage.id} className={selectedLead.stage === stage.id ? "stage active" : "stage"}>
                    {stage.label}
                  </button>
                ))}
              </div>

              <div className="brief-grid">
                <Info label="Score" value={`${selectedLead.leadScore}/100`} />
                <Info label="SLA" value={`${selectedLead.closerSlaHours || 24} h`} />
                <Info label="Owner" value={selectedLead.owner || "Sin asignar"} />
                <Info label="Origen" value={Object.values(selectedLead.trackingParams || {}).filter(Boolean).join(" · ") || "sin UTM"} />
              </div>

              <div className="closer-brief">
                <strong>Brief closer</strong>
                <p>{selectedLead.closerBrief || "Lead sin brief. Revisar formulario y completar cualificación."}</p>
              </div>
            </>
          )}
        </section>

        <section className="builder-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Propuesta a medida</p>
              <h2>Cálculo FUNDAE y módulos</h2>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Empleados
              <input type="number" min="1" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} />
            </label>
            <label>
              Masa salarial anual
              <input type="number" min="0" step="1000" placeholder={`${Number(employeeCount || 1) * 25000}`} value={payroll} onChange={(e) => setPayroll(e.target.value)} />
            </label>
          </div>

          <div className="credit-strip">
            <Info label="Crédito estimado" value={formatCurrency(fundae.credit)} />
            <Info label="Cotización FP" value={formatCurrency(fundae.contribution)} />
            <Info label="Bonificación" value={fundae.bonusRate === null ? "mínimo 420 EUR" : `${Math.round(fundae.bonusRate * 100)} %`} />
            <Info label="Cofinanciación" value={`${Math.round(fundae.cofinancingRate * 100)} %`} />
          </div>

          <div className="course-picker">
            {courses.map((course) => (
              <label key={course.id} className={selectedCourseIds.includes(course.id) ? "course selected" : "course"}>
                <input type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => toggleCourse(course.id)} />
                <span>
                  <strong>{course.title}</strong>
                  <small>{course.master} · {course.hours} h · {formatCurrency(course.price)}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="proposal-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Salida comercial</p>
              <h2>Propuesta, Holded y seguimiento</h2>
            </div>
          </div>

          {localProposal && (
            <div className="proposal-summary">
              <Info label="Módulos" value={selectedCourses.length} />
              <Info label="Horas" value={`${localProposal.totals.hours} h`} />
              <Info label="Coste" value={formatCurrency(localProposal.totals.amount)} />
              <Info label="Cubierto" value={formatCurrency(localProposal.creditApplied)} />
              <Info label="Fuera crédito" value={formatCurrency(localProposal.notCoveredByCredit)} />
              <Info label="Aporte mínimo" value={formatCurrency(localProposal.minimumPrivateContribution)} />
            </div>
          )}

          <div className="action-stack">
            <button className="primary" disabled={busyAction === "proposal" || !selectedCourseIds.length} onClick={generateProposal}>
              {busyAction === "proposal" ? "Registrando..." : "Generar propuesta y tarea CRM"}
            </button>
            <button disabled={!localProposal || busyAction === "download"} onClick={downloadProposal}>
              Descargar propuesta
            </button>
            <button disabled={!localProposal || busyAction === "holded"} onClick={createProforma}>
              {busyAction === "holded" ? "Creando..." : "Crear proforma en Holded"}
            </button>
            <button disabled={!proforma?.proformaId || busyAction === "payment"} onClick={syncPayment}>
              Sincronizar pago y email cliente
            </button>
          </div>

          {proforma && (
            <div className="holded-box">
              <strong>Holded</strong>
              <p>Modo: {proforma.mode} · Proforma: {proforma.proformaId}</p>
              {proforma.mode === "dry-run" && <p>Configura credenciales para crear y descargar PDF real.</p>}
            </div>
          )}

          <div className="proposal-state">
            {["draft", "sent", "accepted", "lost"].map((status) => (
              <button
                key={status}
                className={(proposal?.status || "draft") === status ? "state active" : "state"}
                onClick={() => setProposal((current) => ({ ...(current || localProposal), status }))}
              >
                {status}
              </button>
            ))}
          </div>

          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, tone = "" }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
