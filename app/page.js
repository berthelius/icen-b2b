"use client";

import { useState } from "react";

const C = {
  bg: "#0A0E14",
  surface: "#111620",
  surfaceHover: "#161D2A",
  border: "#1E2A3A",
  accent: "#00E5A0",
  accentDim: "#00B87A",
  amber: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  fundae: "#8B5CF6",
  latam: "#F97316",
  white: "#F0F4F8",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
  mutedText: "#4A5568",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { background: ${C.bg}; }

  .root {
    font-family: 'Syne', sans-serif;
    background: ${C.bg};
    color: ${C.white};
    min-height: 100vh;
    padding: 0;
    overflow-x: hidden;
  }

  .noise {
    position: fixed; inset: 0; opacity: 0.03; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: 
      linear-gradient(${C.border} 1px, transparent 1px),
      linear-gradient(90deg, ${C.border} 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.3;
  }

  .content { position: relative; z-index: 1; }

  /* HEADER */
  .header {
    padding: 48px 64px 40px;
    border-bottom: 1px solid ${C.border};
    display: flex; justify-content: space-between; align-items: flex-end;
    gap: 32px;
  }
  .header-left {}
  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: ${C.accent}; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .eyebrow::before { content: ''; width: 24px; height: 1px; background: ${C.accent}; }
  .main-title {
    font-family: 'DM Serif Display', serif;
    font-size: 52px; line-height: 1.05;
    color: ${C.white};
  }
  .main-title em { font-style: italic; color: ${C.accent}; }
  .subtitle { 
    font-size: 15px; color: ${C.grayLight}; margin-top: 12px; max-width: 480px;
    line-height: 1.6;
  }
  .header-stats { display: flex; gap: 32px; flex-shrink: 0; }
  .hstat { text-align: right; }
  .hstat-val { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; }
  .hstat-val.green { color: ${C.accent}; }
  .hstat-val.amber { color: ${C.amber}; }
  .hstat-val.blue { color: ${C.blue}; }
  .hstat-label { font-size: 11px; color: ${C.gray}; letter-spacing: 0.08em; margin-top: 2px; }

  /* NAV */
  .nav {
    display: flex; gap: 2px; padding: 16px 64px;
    border-bottom: 1px solid ${C.border};
    background: rgba(10,14,20,0.8); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-btn {
    padding: 8px 20px; border-radius: 4px; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    letter-spacing: 0.04em; transition: all 0.15s;
    background: transparent; color: ${C.gray};
  }
  .nav-btn:hover { color: ${C.white}; background: ${C.border}; }
  .nav-btn.active { color: ${C.bg}; background: ${C.accent}; }

  /* MAIN */
  .main { padding: 48px 64px; }

  /* SECTION HEADER */
  .sec-header { margin-bottom: 40px; }
  .sec-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.25em; text-transform: uppercase; color: ${C.gray};
    margin-bottom: 8px;
  }
  .sec-title {
    font-family: 'DM Serif Display', serif; font-size: 36px; color: ${C.white};
  }
  .sec-desc { font-size: 15px; color: ${C.grayLight}; margin-top: 8px; line-height: 1.65; max-width: 640px; }

  /* CARDS */
  .card {
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px;
    padding: 28px 32px;
  }
  .card-sm { padding: 20px 24px; }
  .card-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px;
  }
  .card-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .card-body { font-size: 14px; color: ${C.grayLight}; line-height: 1.65; }

  /* BRTHLS SECTION */
  .brthls-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;
  }
  .brthls-hero {
    background: linear-gradient(135deg, #0D1B2A 0%, #0A1628 100%);
    border: 1px solid #1A3050; border-radius: 8px; padding: 36px;
    grid-column: span 2; position: relative; overflow: hidden;
  }
  .brthls-hero::before {
    content: 'BRTHLS'; position: absolute; right: -20px; top: 50%; transform: translateY(-50%);
    font-family: 'DM Serif Display', serif; font-size: 160px; font-style: italic;
    color: rgba(0,229,160,0.04); line-height: 1; pointer-events: none; white-space: nowrap;
  }
  .brthls-tag {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
    background: rgba(0,229,160,0.1); border: 1px solid rgba(0,229,160,0.2);
    border-radius: 20px; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.15em; color: ${C.accent}; margin-bottom: 20px;
  }
  .brthls-tag::before { content: '●'; font-size: 6px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  
  .pipeline-flow {
    display: flex; align-items: center; gap: 0; margin-top: 24px; flex-wrap: wrap; gap: 8px;
  }
  .pipe-node {
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 6px;
    padding: 10px 16px; font-size: 12px; font-weight: 600; white-space: nowrap;
  }
  .pipe-arrow { color: ${C.accent}; font-size: 14px; margin: 0 4px; flex-shrink: 0; }
  .pipe-node.accent { border-color: ${C.accent}; color: ${C.accent}; }
  .pipe-node.fundae { border-color: ${C.fundae}; color: ${C.fundae}; }

  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
  .feature-item {
    background: rgba(0,0,0,0.3); border: 1px solid ${C.border}; border-radius: 6px;
    padding: 14px 16px;
  }
  .feature-icon { font-size: 18px; margin-bottom: 8px; }
  .feature-name { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
  .feature-desc { font-size: 11px; color: ${C.gray}; line-height: 1.5; }

  /* DUAL TRACK */
  .dual-track { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .track {
    border-radius: 8px; overflow: hidden; border: 1px solid;
  }
  .track.spain { border-color: rgba(139,92,246,0.3); }
  .track.latam { border-color: rgba(249,115,22,0.3); }
  .track-header {
    padding: 20px 28px; display: flex; align-items: center; gap: 12px;
  }
  .track.spain .track-header { background: rgba(139,92,246,0.08); }
  .track.latam .track-header { background: rgba(249,115,22,0.08); }
  .track-flag { font-size: 20px; }
  .track-name { font-size: 16px; font-weight: 800; }
  .track.spain .track-name { color: ${C.fundae}; }
  .track.latam .track-name { color: ${C.latam}; }
  .track-subtitle { font-size: 12px; color: ${C.gray}; }
  .track-body { padding: 24px 28px; background: ${C.surface}; }

  .funnel-step {
    display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px;
  }
  .funnel-step:last-child { margin-bottom: 0; }
  .step-num {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
    border: 1px solid;
  }
  .track.spain .step-num { border-color: ${C.fundae}; color: ${C.fundae}; background: rgba(139,92,246,0.1); }
  .track.latam .step-num { border-color: ${C.latam}; color: ${C.latam}; background: rgba(249,115,22,0.1); }
  .step-content {}
  .step-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .step-desc { font-size: 12px; color: ${C.grayLight}; line-height: 1.5; }
  .step-badge {
    display: inline-block; margin-top: 5px; padding: 2px 8px; border-radius: 3px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
  }
  .badge-green { background: rgba(0,229,160,0.1); color: ${C.accent}; }
  .badge-fundae { background: rgba(139,92,246,0.1); color: ${C.fundae}; }
  .badge-amber { background: rgba(245,158,11,0.1); color: ${C.amber}; }
  .badge-latam { background: rgba(249,115,22,0.1); color: ${C.latam}; }

  .connector { 
    width: 1px; height: 16px; margin: 0 0 0 13px;
    background: linear-gradient(${C.border}, transparent);
    display: block;
  }

  /* OUTREACH SEQUENCE */
  .sequence-timeline { position: relative; }
  .seq-line {
    position: absolute; left: 52px; top: 0; bottom: 0; width: 1px;
    background: linear-gradient(${C.accent}, ${C.border} 80%, transparent);
  }
  .seq-item {
    display: flex; gap: 0; align-items: flex-start; margin-bottom: 8px;
    position: relative; cursor: pointer;
  }
  .seq-day {
    width: 40px; font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: ${C.gray}; padding-top: 14px; text-align: right; flex-shrink: 0;
  }
  .seq-dot {
    width: 24px; flex-shrink: 0; display: flex; flex-direction: column;
    align-items: center; padding-top: 12px; gap: 0; z-index: 1;
  }
  .seq-dot-inner {
    width: 10px; height: 10px; border-radius: 50%; border: 2px solid;
    background: ${C.bg}; flex-shrink: 0; transition: all 0.2s;
  }
  .seq-item:hover .seq-dot-inner { transform: scale(1.4); }
  .seq-content {
    flex: 1; background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 6px; padding: 12px 16px; margin-left: 12px;
    transition: all 0.2s;
  }
  .seq-item:hover .seq-content { border-color: rgba(0,229,160,0.2); }
  .seq-channel {
    font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.15em;
    text-transform: uppercase; margin-bottom: 4px;
  }
  .seq-subject { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .seq-hook { font-size: 12px; color: ${C.grayLight}; line-height: 1.5; }
  .seq-trigger {
    margin-top: 6px; font-size: 11px; padding: 3px 8px; border-radius: 3px;
    display: inline-block; background: rgba(0,229,160,0.05); 
    border: 1px solid rgba(0,229,160,0.15); color: ${C.accent};
  }

  /* ECONOMICS */
  .econ-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .econ-card {
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px;
    padding: 24px; position: relative; overflow: hidden;
  }
  .econ-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  }
  .econ-card.green::after { background: ${C.accent}; }
  .econ-card.amber::after { background: ${C.amber}; }
  .econ-card.fundae::after { background: ${C.fundae}; }
  .econ-label { font-size: 11px; color: ${C.gray}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
  .econ-val { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700; line-height: 1; }
  .econ-val.green { color: ${C.accent}; }
  .econ-val.amber { color: ${C.amber}; }
  .econ-val.fundae { color: ${C.fundae}; }
  .econ-sub { font-size: 12px; color: ${C.gray}; margin-top: 8px; line-height: 1.5; }
  .econ-vs { 
    display: flex; align-items: center; gap: 8px; margin-top: 10px;
    padding-top: 10px; border-top: 1px solid ${C.border};
    font-size: 11px; color: ${C.gray};
  }
  .econ-vs-val { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; }

  .case-study {
    background: linear-gradient(135deg, ${C.surface}, #0D1520);
    border: 1px solid ${C.border}; border-radius: 8px; padding: 28px 32px;
    display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: center;
  }
  .case-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: ${C.gray}; margin-bottom: 8px; }
  .case-title { font-family: 'DM Serif Display', serif; font-size: 22px; margin-bottom: 8px; }
  .case-desc { font-size: 13px; color: ${C.grayLight}; line-height: 1.6; }
  .case-total { text-align: right; }
  .case-total-label { font-size: 11px; color: ${C.gray}; margin-bottom: 4px; }
  .case-total-val { font-family: 'JetBrains Mono', monospace; font-size: 42px; font-weight: 700; color: ${C.accent}; line-height: 1; }
  .case-total-sub { font-size: 11px; color: ${C.gray}; margin-top: 4px; }
  .case-breakdown { display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
  .case-item { 
    padding: 6px 14px; border-radius: 4px;
    border: 1px solid ${C.border}; font-size: 12px;
  }
  .case-item span { font-weight: 700; }

  /* SEGMENTS */
  .seg-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .seg-tier {
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px;
    overflow: hidden;
  }
  .seg-header {
    padding: 16px 20px; display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid ${C.border};
  }
  .seg-tier-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;
    padding: 3px 8px; border-radius: 3px; letter-spacing: 0.1em;
  }
  .t1 .seg-tier-badge { background: rgba(0,229,160,0.15); color: ${C.accent}; }
  .t2 .seg-tier-badge { background: rgba(59,130,246,0.15); color: ${C.blue}; }
  .t3 .seg-tier-badge { background: rgba(249,115,22,0.15); color: ${C.latam}; }
  .seg-tier-name { font-size: 13px; font-weight: 700; }
  .seg-tier-sub { font-size: 11px; color: ${C.gray}; }
  .seg-body { padding: 16px 20px; }
  .seg-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; font-size: 13px; }
  .seg-item:last-child { margin-bottom: 0; }
  .seg-dot-t { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
  .t1 .seg-dot-t { background: ${C.accent}; }
  .t2 .seg-dot-t { background: ${C.blue}; }
  .t3 .seg-dot-t { background: ${C.latam}; }
  .seg-item-text {}
  .seg-item-name { font-weight: 600; margin-bottom: 1px; }
  .seg-item-why { font-size: 11px; color: ${C.gray}; line-height: 1.4; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

  /* ROADMAP */
  .roadmap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .roadmap-q {
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px;
    overflow: hidden; position: relative;
  }
  .roadmap-q-header {
    padding: 16px 20px; border-bottom: 1px solid ${C.border};
    display: flex; justify-content: space-between; align-items: center;
  }
  .roadmap-q-name { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; }
  .roadmap-q-sub { font-size: 10px; color: ${C.gray}; }
  .roadmap-q-target { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; }
  .roadmap-q-body { padding: 16px 20px; }
  .roadmap-item { display: flex; gap: 8px; margin-bottom: 8px; font-size: 12px; line-height: 1.4; }
  .roadmap-item:last-child { margin-bottom: 0; }
  .roadmap-dot { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .roadmap-q-bar { height: 3px; }

  .tag { 
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 600;
    letter-spacing: 0.05em;
  }

  @media (max-width: 1100px) {
    .header { padding: 32px; flex-direction: column; align-items: flex-start; }
    .main { padding: 32px; }
    .nav { padding: 12px 32px; }
    .dual-track, .brthls-grid, .econ-grid, .seg-grid, .roadmap-grid, .two-col { 
      grid-template-columns: 1fr; 
    }
    .brthls-hero { grid-column: span 1; }
    .feature-grid { grid-template-columns: 1fr 1fr; }
  }
`;

const sequenceItems = [
  {
    day: "D0", channel: "email", color: C.accent,
    subject: "Presentamos ICEN + publicamos tus ofertas de empleo gratis",
    hook: "ICEN Connect: difundimos tus ofertas a 54.679 profesionales del sector deporte y salud en España. Sin coste. Sin intermediarios.",
    trigger: null
  },
  {
    day: "D3", channel: "email", color: C.accent,
    subject: "Convenio de colaboración: 10 minutos, firma digital",
    hook: "Formalizamos la relación. Apareces como empresa colaboradora ICEN ante nuestros alumnos y empresas del sector.",
    trigger: null
  },
  {
    day: "D7", channel: "linkedin", color: C.blue,
    subject: "Conexión profesional + mismo gancho",
    hook: "Conexión directa con el responsable de RRHH/dirección. Mensaje corto: hemos visto que tienen X empleados del sector.",
    trigger: null
  },
  {
    day: "D10", channel: "email", color: C.fundae,
    subject: "Tus empleados pueden formarse a coste 0 — Kit FUNDAE",
    hook: "Si tienen créditos de bonificación disponibles, sus empleados acceden a Masters y FP oficiales sin que la empresa pague nada.",
    trigger: "Solo España"
  },
  {
    day: "D14", channel: "llamada", color: C.amber,
    subject: "Llamada cualificada (solo si hay apertura previa)",
    hook: "No llamada fría. Solo si abrieron alguno de los emails anteriores o conectaron en LinkedIn. 10 minutos para cerrar el convenio.",
    trigger: "Si abrió email o conectó en LinkedIn"
  },
  {
    day: "D21", channel: "email", color: C.latam,
    subject: "Programa Embajadores ICEN — 10% + 5%",
    hook: "Tus empleados y contactos acceden con 10% de descuento. Tu empresa gana 5% de comisión por cada matrícula cerrada. Código único en CRM.",
    trigger: "Si no respondió a FUNDAE o es LATAM"
  },
];

const channelColors = { email: C.accent, linkedin: C.blue, llamada: C.amber, latam: C.latam, fundae: C.fundae };
const channelIcons = { email: "✉", linkedin: "in", llamada: "📞", latam: "🌎", fundae: "🎓" };

export default function App() {
  const [tab, setTab] = useState("herramienta");

  const tabs = [
    { id: "herramienta", label: "La Herramienta" },
    { id: "estrategia", label: "Estrategia B2B" },
    { id: "secuencia", label: "Secuencia Outreach" },
    { id: "economia", label: "Economía & ROI" },
    { id: "segmentos", label: "Segmentos & Roadmap" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="root">
        <div className="noise" />
        <div className="grid-bg" />
        <div className="content">
          <header className="header">
            <div className="header-left">
              <div className="eyebrow">ICEN · Plan Estratégico B2B 2026</div>
              <h1 className="main-title">
                Canal B2B:<br />
                <em>Growth Engineering</em>
              </h1>
              <p className="subtitle">
                Herramienta propietaria BRTHLS desplegada en ICEN · Scraping + outreach automatizado ·
                ICEN Connect como gancho · FUNDAE (España) + Embajadores (España + LATAM)
              </p>
            </div>
            <div className="header-stats">
              <div className="hstat">
                <div className="hstat-val green">€244</div>
                <div className="hstat-label">CAC canal embajador</div>
              </div>
              <div className="hstat">
                <div className="hstat-val amber">vs €416</div>
                <div className="hstat-label">CPA canal ads actual</div>
              </div>
              <div className="hstat">
                <div className="hstat-val blue">−41%</div>
                <div className="hstat-label">reducción coste adq.</div>
              </div>
            </div>
          </header>

          <nav className="nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`nav-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main className="main">

            {tab === "herramienta" && (
              <div>
                <div className="sec-header">
                  <div className="sec-eyebrow">Infraestructura · Stack propietario</div>
                  <h2 className="sec-title">La herramienta que lo hace posible</h2>
                  <p className="sec-desc">
                    Desarrollada originalmente bajo el proyecto BRTHLS, la herramienta se clona y adapta a la infraestructura de ICEN
                    para gestión de leads, scraping B2B, outreach automatizado y conexión con Twenty CRM y el ecosistema de plataformas de ICEN.
                  </p>
                </div>

                <div className="brthls-grid">
                  <div className="brthls-hero card">
                    <div className="brthls-tag">Sistema activo · Desplegado en servidores ICEN</div>
                    <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 8 }}>
                      BRTHLS Growth Engine <span style={{ fontStyle: "italic", color: C.accent }}>→ ICEN B2B Layer</span>
                    </h3>
                    <p style={{ fontSize: 14, color: C.grayLight, maxWidth: 560, lineHeight: 1.65 }}>
                      Sistema propietario de captación y gestión de leads B2B. Desarrollado e iterado fuera de ICEN,
                      adaptado, optimizado y desplegado en la infraestructura de Digital Ocean de ICEN para operar
                      sobre sus canales y conectarse nativamente con Twenty CRM, n8n, Chatwoot y el data layer existente.
                    </p>
                    <div className="pipeline-flow">
                      {[
                        { label: "Scraping", sub: "Google Maps · LinkedIn · Directorios" },
                        null,
                        { label: "Enriquecimiento", sub: "Email · Tel · RRSS · FUNDAE check" },
                        null,
                        { label: "Twenty CRM", sub: "Lead estructurado + pipeline" },
                        null,
                        { label: "n8n Outreach", sub: "Secuencia automatizada D0→D21" },
                        null,
                        { label: "Chatwoot", sub: "Gestión manual si responde" },
                      ].map((n, i) => n === null
                        ? <span key={i} className="pipe-arrow">→</span>
                        : <div key={i} className={`pipe-node ${i === 4 ? "accent" : ""}`}>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{n.label}</div>
                          <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>{n.sub}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-label" style={{ color: C.accent }}>Módulo principal · Captación</div>
                    <div className="card-title">Scraping & Lead Generation</div>
                    <div className="card-body" style={{ marginBottom: 16 }}>
                      Extracción automatizada de empresas objetivo: nombre, sector, ubicación, contacto, presencia digital y estimación de empleados.
                      Fuentes: Google Maps, LinkedIn, directorios sectoriales, CNAE.
                    </div>
                    <div className="feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {[
                        { icon: "🗺️", name: "Google Maps scraper", desc: "Gimnasios, clínicas, clubs, centros" },
                        { icon: "💼", name: "LinkedIn scraper", desc: "Responsables RRHH y dirección" },
                        { icon: "🏢", name: "Directorios CNAE", desc: "Filtro por código de actividad" },
                        { icon: "✉️", name: "Email finder", desc: "Enriquecimiento automático de contacto" },
                      ].map((f, i) => (
                        <div key={i} className="feature-item">
                          <div className="feature-icon">{f.icon}</div>
                          <div className="feature-name">{f.name}</div>
                          <div className="feature-desc">{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-label" style={{ color: C.blue }}>Módulo · Integración CRM</div>
                    <div className="card-title">Conexión con ecosistema ICEN</div>
                    <div className="card-body" style={{ marginBottom: 16 }}>
                      Cada lead scrapeado llega a Twenty CRM como empresa con contactos estructurados,
                      etiquetado por tier y canal de origen, con historial de outreach sincronizado.
                    </div>
                    <div className="feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {[
                        { icon: "🔗", name: "Twenty CRM API", desc: "Empresa + contactos + pipeline" },
                        { icon: "⚙️", name: "n8n workflows", desc: "Secuencia outreach automatizada" },
                        { icon: "💬", name: "Chatwoot", desc: "Handoff a gestión manual" },
                        { icon: "📊", name: "Umami analytics", desc: "Tracking de aperturas y clics" },
                      ].map((f, i) => (
                        <div key={i} className="feature-item">
                          <div className="feature-icon">{f.icon}</div>
                          <div className="feature-name">{f.name}</div>
                          <div className="feature-desc">{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: 24 }}>
                  <div className="card-label" style={{ color: C.amber }}>Diferenciación clave · Por qué esto importa</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 8 }}>
                    {[
                      {
                        title: "No es una herramienta de terceros",
                        body: "El código es de ICEN. Se itera, se mejora, se adapta a cada campaña y cada segmento sin depender de licencias ni costes por uso. La herramienta crece con el negocio.",
                        color: C.accent
                      },
                      {
                        title: "Conectada al data layer existente",
                        body: "GTM server-side + Stape + Twenty CRM + n8n ya están en producción. La herramienta se enchufan en ese ecosistema sin construir nada desde cero.",
                        color: C.blue
                      },
                      {
                        title: "Iterable sobre los canales de ICEN",
                        body: "Cada mejora en scraping, en secuencias de outreach o en scoring de leads se despliega en cuestión de horas, no semanas. Ciclo de iteración ultra-rápido.",
                        color: C.amber
                      },
                    ].map((item, i) => (
                      <div key={i} style={{ borderLeft: `2px solid ${item.color}`, paddingLeft: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: item.color }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: C.grayLight, lineHeight: 1.65 }}>{item.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "estrategia" && (
              <div>
                <div className="sec-header">
                  <div className="sec-eyebrow">Estrategia · Dual track</div>
                  <h2 className="sec-title">España y LATAM: misma estructura, diferente monetización</h2>
                  <p className="sec-desc">
                    La propuesta de valor B2B es idéntica en ambos mercados: ICEN Connect como gancho sin fricción,
                    convenio institucional, y programa de embajadores. La diferencia está en el nivel 2:
                    FUNDAE solo aplica en España; en LATAM el equivalente es volumen corporativo con descuento.
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="card" style={{ marginBottom: 16, background: "rgba(0,229,160,0.03)", borderColor: "rgba(0,229,160,0.15)" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 8, background: "rgba(0,229,160,0.1)", border: `1px solid rgba(0,229,160,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔗</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>ICEN Connect — El gancho universal <span style={{ color: C.accent }}>(aplica en ambos mercados)</span></div>
                        <div style={{ fontSize: 13, color: C.grayLight, lineHeight: 1.65 }}>
                          Bolsa de empleo sectorial gratuita. ICEN difunde las ofertas de empleo de la empresa a sus 54.679 contactos del sector deporte, salud y nutrición más sus redes sociales.
                          La empresa no paga nada, gana visibilidad y candidatos cualificados. ICEN gana un contacto legítimo, seguimiento en RRSS con justificación natural
                          (<em>"síguenos para que tus empleados vean las oportunidades"</em>) y una relación donde ya le deben algo antes de hablar de formación.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dual-track">
                  <div className="track spain">
                    <div className="track-header">
                      <div className="track-flag">🇪🇸</div>
                      <div>
                        <div className="track-name">España · FUNDAE Track</div>
                        <div className="track-subtitle">Gimnasios · Clínicas · Clubs deportivos · Centros de nutrición</div>
                      </div>
                    </div>
                    <div className="track-body">
                      {[
                        {
                          num: "01", title: "ICEN Connect + Convenio",
                          desc: "Publicación de ofertas de empleo gratuita. Firma del convenio de colaboración institucional en 10 min vía Docuseal. Seguimiento RRSS.",
                          badges: [{ label: "Gratis para ellos", cls: "badge-green" }, { label: "Gancho inicial", cls: "badge-green" }]
                        },
                        {
                          num: "02", title: "FUNDAE — Formación bonificada 0€",
                          desc: "Sus empleados se forman en Masters y FP oficiales ICEN usando los créditos de bonificación de la Seguridad Social. La empresa no desembolsa nada. ICEN cobra directamente de FUNDAE.",
                          badges: [{ label: "Coste 0 para la empresa", cls: "badge-fundae" }, { label: "Solo España", cls: "badge-fundae" }]
                        },
                        {
                          num: "03", title: "Programa Embajadores",
                          desc: "10% descuento para empleados y contactos de la empresa. 5% de comisión para la empresa por cada matrícula cerrada. Código de referido único en CRM con tracking automático.",
                          badges: [{ label: "+5% comisión empresa", cls: "badge-amber" }, { label: "−10% alumno", cls: "badge-amber" }]
                        },
                        {
                          num: "04", title: "Renovación anual FUNDAE",
                          desc: "Los créditos FUNDAE se renuevan cada año. La empresa entra en flujo de renovación automática: revisión de créditos disponibles en Q4 y plan de formación para el año siguiente.",
                          badges: [{ label: "Recurrente", cls: "badge-fundae" }, { label: "Alto LTV", cls: "badge-green" }]
                        },
                      ].map((step, i) => (
                        <div key={i}>
                          <div className="funnel-step">
                            <div className="step-num">{step.num}</div>
                            <div className="step-content">
                              <div className="step-title">{step.title}</div>
                              <div className="step-desc">{step.desc}</div>
                              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                {step.badges.map((b, j) => <span key={j} className={`step-badge ${b.cls}`}>{b.label}</span>)}
                              </div>
                            </div>
                          </div>
                          {i < 3 && <div className="connector" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="track latam">
                    <div className="track-header">
                      <div className="track-flag">🌎</div>
                      <div>
                        <div className="track-name">LATAM · Corporate Track</div>
                        <div className="track-subtitle">México · Colombia · Chile · Argentina · Perú</div>
                      </div>
                    </div>
                    <div className="track-body">
                      {[
                        {
                          num: "01", title: "ICEN Connect + Convenio",
                          desc: "Idéntico al track España. Publicación de ofertas, convenio institucional, seguimiento RRSS. El gancho funciona igual independientemente del país.",
                          badges: [{ label: "Gratis para ellos", cls: "badge-green" }, { label: "Universal", cls: "badge-green" }]
                        },
                        {
                          num: "02", title: "Acuerdo corporativo por volumen",
                          desc: "Sin FUNDAE, el gancho es el precio. Descuento corporativo del 15-20% para grupos de 3+ empleados. Una empresa con 5 empleados interesados en Nutrición accede a precio reducido con factura a empresa.",
                          badges: [{ label: "−15% grupos 3+", cls: "badge-latam" }, { label: "Factura empresa", cls: "badge-latam" }]
                        },
                        {
                          num: "03", title: "Programa Embajadores",
                          desc: "Exactamente igual que España: 10% descuento para contactos de la empresa, 5% de comisión para la empresa. En LATAM el ticket es ~€2.733, la comisión es ~€137 pero el volumen potencial es mayor.",
                          badges: [{ label: "+5% comisión empresa", cls: "badge-amber" }, { label: "Escala x mercado", cls: "badge-amber" }]
                        },
                        {
                          num: "04", title: "SENCE / SENA / STPS (futuro)",
                          desc: "En Q3-Q4 explorar acreditación en los sistemas de bonificación locales. Chile (SENCE con OTEC), Colombia (SENA). No es Q1 ni Q2 — requiere proceso de certificación propio de cada país.",
                          badges: [{ label: "Q3-Q4 2026", cls: "badge-latam" }, { label: "Investigar Q2", cls: "badge-latam" }]
                        },
                      ].map((step, i) => (
                        <div key={i}>
                          <div className="funnel-step">
                            <div className="step-num">{step.num}</div>
                            <div className="step-content">
                              <div className="step-title">{step.title}</div>
                              <div className="step-desc">{step.desc}</div>
                              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                {step.badges.map((b, j) => <span key={j} className={`step-badge ${b.cls}`}>{b.label}</span>)}
                              </div>
                            </div>
                          </div>
                          {i < 3 && <div className="connector" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "secuencia" && (
              <div>
                <div className="sec-header">
                  <div className="sec-eyebrow">Outreach · Secuencia automatizada n8n</div>
                  <h2 className="sec-title">D0 → D21: del primer contacto al cierre</h2>
                  <p className="sec-desc">
                    Cada empresa scrapeada entra en una secuencia automatizada de 21 días orquestada por n8n.
                    En el momento en que responde, sale del flujo automático y entra en gestión manual en Twenty CRM.
                    Sin respuesta en 30 días: archivo y reactivación automática a los 6 meses.
                  </p>
                </div>

                <div className="two-col">
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: C.gray, textTransform: "uppercase", marginBottom: 20 }}>Secuencia completa</div>
                    <div className="sequence-timeline">
                      <div className="seq-line" />
                      {sequenceItems.map((item, i) => (
                        <div key={i} className="seq-item">
                          <div className="seq-day">{item.day}</div>
                          <div className="seq-dot">
                            <div className="seq-dot-inner" style={{ borderColor: item.color, background: item.color + "22" }} />
                          </div>
                          <div className="seq-content">
                            <div className="seq-channel" style={{ color: item.color }}>
                              {channelIcons[item.channel]} {item.channel.toUpperCase()}
                            </div>
                            <div className="seq-subject">{item.subject}</div>
                            <div className="seq-hook">{item.hook}</div>
                            {item.trigger && <div className="seq-trigger">↳ {item.trigger}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: C.gray, textTransform: "uppercase", marginBottom: 20 }}>Lógica de bifurcación</div>
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.accent, marginBottom: 12 }}>✓ Si responde en cualquier punto</div>
                      <div style={{ fontSize: 13, color: C.grayLight, lineHeight: 1.65, marginBottom: 12 }}>
                        Sale inmediatamente del flujo automático. Entra en Twenty CRM como oportunidad activa con todo el historial de interacción sincronizado. Chatwoot recibe notificación para gestión manual.
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["Sale del flujo auto", "Entra en Twenty CRM", "Notif. Chatwoot"].map((t, i) => (
                          <span key={i} className="step-badge badge-green">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="card" style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.gray, marginBottom: 12 }}>○ Si no responde en 30 días</div>
                      <div style={{ fontSize: 13, color: C.grayLight, lineHeight: 1.65, marginBottom: 12 }}>
                        Empresa archivada. Entra en lista de reactivación automática a los 6 meses con secuencia actualizada. No se considera lead muerto — muchas empresas responden en el segundo intento.
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span className="step-badge badge-amber">Archivo D30</span>
                        <span className="step-badge badge-amber">Reactivación M6</span>
                      </div>
                    </div>

                    <div className="card" style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.fundae, marginBottom: 12 }}>⚡ Bifurcación España vs LATAM</div>
                      <div style={{ fontSize: 13, color: C.grayLight, lineHeight: 1.65, marginBottom: 12 }}>
                        El campo "país" en el CRM activa o desactiva automáticamente el email D10 (FUNDAE). En LATAM ese slot se sustituye por el email de acuerdo corporativo por volumen.
                        El resto de la secuencia es idéntico.
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span className="step-badge badge-fundae">D10 → FUNDAE (ES)</span>
                        <span className="step-badge badge-latam">D10 → Volumen (LATAM)</span>
                      </div>
                    </div>

                    <div className="card">
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.amber, marginBottom: 12 }}>📊 Métricas que rastreamos</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { label: "Tasa apertura emails", target: ">35%", color: C.accent },
                          { label: "Tasa respuesta total", target: ">8%", color: C.accent },
                          { label: "Lead → convenio", target: ">20%", color: C.blue },
                          { label: "Convenio → FUNDAE/venta", target: ">15%", color: C.fundae },
                          { label: "Embajadores activos", target: ">30 Q4", color: C.amber },
                          { label: "Revenue por empresa", target: ">€8k/año", color: C.amber },
                        ].map((m, i) => (
                          <div key={i} style={{ padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 4, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{m.label}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: m.color }}>{m.target}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "economia" && (
              <div>
                <div className="sec-header">
                  <div className="sec-eyebrow">Economía · Por qué este canal es el mejor del stack</div>
                  <h2 className="sec-title">Comparativa de canales y eficiencia del B2B</h2>
                  <p className="sec-desc">
                    El canal de ads actual tiene un CPA de €416 y ROAS estimado de 11,5x.
                    El canal embajador cuesta €244 por matrícula y el canal FUNDAE tiene coste de adquisición
                    equivalente al outreach (~€30-50 por empresa contactada). La matemática es clara.
                  </p>
                </div>

                <div className="econ-grid">
                  <div className="econ-card green">
                    <div className="econ-label">Canal embajador · CAC</div>
                    <div className="econ-val green">€244</div>
                    <div className="econ-sub">5% comisión sobre ticket medio €4.881. Sin coste de ads. Alumno llega precalificado por la empresa.</div>
                    <div className="econ-vs">
                      <span>vs canal ads</span>
                      <span className="econ-vs-val" style={{ color: C.accent }}>−41%</span>
                    </div>
                  </div>
                  <div className="econ-card fundae">
                    <div className="econ-label">Canal FUNDAE · CAC estimado</div>
                    <div className="econ-val fundae">~€40</div>
                    <div className="econ-sub">Coste de outreach por empresa contactada. Una empresa con 3 empleados = €3.600 revenue. Ratio CAC:revenue excepcional.</div>
                    <div className="econ-vs">
                      <span>vs canal ads</span>
                      <span className="econ-vs-val" style={{ color: C.fundae }}>−90%</span>
                    </div>
                  </div>
                  <div className="econ-card amber">
                    <div className="econ-label">Margen bruto por canal</div>
                    <div className="econ-val amber">€4.149</div>
                    <div className="econ-sub">Margen canal embajador por matrícula Masters (€4.393 revenue − €244 comisión). Vs €4.465 canal ads — diferencia de solo €316 pero sin gastar €416 en ads.</div>
                    <div className="econ-vs">
                      <span>ahorro neto</span>
                      <span className="econ-vs-val" style={{ color: C.amber }}>+€172/mat.</span>
                    </div>
                  </div>
                </div>

                <div className="case-study" style={{ marginBottom: 24 }}>
                  <div>
                    <div className="case-label">Caso práctico · Una sola empresa bien trabajada</div>
                    <h3 className="case-title">Gimnasio con 25 empleados del sector</h3>
                    <p className="case-desc">
                      Gimnasio con 25 empleados, 3 con créditos FUNDAE disponibles y 5 empleados interesados en formación particular.
                      La empresa entra como embajador activo y genera 8 matrículas adicionales de su red en el primer año.
                    </p>
                    <div className="case-breakdown">
                      {[
                        { label: "FUNDAE (3 emp)", val: "€3.600", color: C.fundae },
                        { label: "Emp. particulares (5)", val: "€21.965", color: C.blue },
                        { label: "Embajador comisión", val: "−€1.097", color: C.red },
                        { label: "Revenue neto", val: "€24.468", color: C.accent },
                      ].map((item, i) => (
                        <div key={i} className="case-item" style={{ borderColor: item.color + "44" }}>
                          {item.label}: <span style={{ color: item.color }}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="case-total">
                    <div className="case-total-label">Revenue total · 1 empresa · 1 año</div>
                    <div className="case-total-val">€24k</div>
                    <div className="case-total-sub">CAC de outreach: ~€50<br />Con canal ads: habría costado €3.328 en ads</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-label" style={{ color: C.accent }}>Proyección B2B 2026 · Por trimestre</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 12 }}>
                    {[
                      { q: "Q2", empresas: 20, mat: 40, rev: "€120k", note: "Primeras 20 empresas. FUNDAE + Embajadores early adopters.", color: C.fundae },
                      { q: "Q3", empresas: 60, mat: 120, rev: "€360k", note: "FUNDAE escalando. Renovaciones primer ciclo. Pipeline activo.", color: C.accent },
                      { q: "Q4", empresas: 100, mat: 200, rev: "€600k", note: "Embajadores activos. Renovaciones FUNDAE. Primer pipeline LATAM.", color: C.amber },
                      { q: "Total", empresas: 100, mat: 360, rev: "€1.08M", note: "Escenario optimista. Escenario base: 150 empresas · €216k.", color: C.blue },
                    ].map((item, i) => (
                      <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: 16, border: `1px solid ${item.color}22` }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: item.color, marginBottom: 6 }}>{item.q} 2026</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.rev}</div>
                        <div style={{ fontSize: 11, color: C.gray, marginBottom: 8 }}>{item.empresas} empresas · {item.mat} matrículas est.</div>
                        <div style={{ fontSize: 11, color: C.grayLight, lineHeight: 1.5 }}>{item.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "segmentos" && (
              <div>
                <div className="sec-header">
                  <div className="sec-eyebrow">Targeting · A quién vamos a buscar</div>
                  <h2 className="sec-title">Segmentos de scraping y roadmap de activación</h2>
                  <p className="sec-desc">
                    El scraping prioriza los sectores con mayor densidad de empleados del perfil ICEN.
                    Tier 1 son los que convierten más rápido, Tier 2 tiene más volumen, Tier 3 es LATAM.
                  </p>
                </div>

                <div className="seg-grid" style={{ marginBottom: 32 }}>
                  <div className="seg-tier t1">
                    <div className="seg-header">
                      <div className="seg-tier-badge">TIER 1</div>
                      <div>
                        <div className="seg-tier-name">Alta conversión · España</div>
                        <div className="seg-tier-sub">Emplean exactamente el perfil ICEN</div>
                      </div>
                    </div>
                    <div className="seg-body">
                      {[
                        { name: "Gimnasios y centros deportivos", why: "Emplean entrenadores personales y monitores. Perfil ideal para PEAC y Masters TECH." },
                        { name: "Clínicas de fisioterapia", why: "Alta demanda de TSD Dietética y Masters nutrición. Empleados con motivación de crecimiento." },
                        { name: "Centros de nutrición y dietética", why: "Empleados directamente relacionados con el catálogo FP y Masters." },
                        { name: "Clubs deportivos (pro y semipro)", why: "Cuerpos técnicos, preparadores físicos, nutricionistas. Múltiples perfiles en una empresa." },
                        { name: "Federaciones deportivas", why: "Muchos empleados, presupuesto para formación, FUNDAE elevado." },
                      ].map((s, i) => (
                        <div key={i} className="seg-item">
                          <div className="seg-dot-t" />
                          <div className="seg-item-text">
                            <div className="seg-item-name">{s.name}</div>
                            <div className="seg-item-why">{s.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="seg-tier t2">
                    <div className="seg-header">
                      <div className="seg-tier-badge">TIER 2</div>
                      <div>
                        <div className="seg-tier-name">Alto volumen · España</div>
                        <div className="seg-tier-sub">Mayor ciclo de venta pero más escala</div>
                      </div>
                    </div>
                    <div className="seg-body">
                      {[
                        { name: "Hoteles con spa/wellness", why: "Monitores, técnicos de actividad física, nutricionistas. Grandes cadenas = muchos empleados." },
                        { name: "Mutuas laborales", why: "Programas de salud laboral. FUNDAE elevado. Decisión en RRHH, ciclo más largo." },
                        { name: "Centros educativos (EF)", why: "Profesores de EF con interés en formación continua. Motivación intrínseca alta." },
                        { name: "Cadenas de farmacias", why: "Nutricionistas y dietistas empleados. FP Dietética encaja perfectamente." },
                        { name: "Residencias y centros de día", why: "Fisioterapeutas y técnicos de actividad. FUNDAE disponible y subuso." },
                      ].map((s, i) => (
                        <div key={i} className="seg-item">
                          <div className="seg-dot-t" />
                          <div className="seg-item-text">
                            <div className="seg-item-name">{s.name}</div>
                            <div className="seg-item-why">{s.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="seg-tier t3">
                    <div className="seg-header">
                      <div className="seg-tier-badge">TIER 3</div>
                      <div>
                        <div className="seg-tier-name">LATAM · Q3 activación</div>
                        <div className="seg-tier-sub">Corporate track · Acuerdo por volumen</div>
                      </div>
                    </div>
                    <div className="seg-body">
                      {[
                        { name: "Cadenas de gimnasios MX/CO/CL", why: "Smartfit, Bodytech, Elefante. Miles de empleados. Corporate deal con descuento por volumen." },
                        { name: "Clínicas privadas multisede", why: "Colombia y México tienen redes grandes. Nutricionistas y fisios buscando titulación española." },
                        { name: "Federaciones deportivas nacionales", why: "México, Colombia, Chile tienen federaciones con presupuesto de formación." },
                        { name: "Empresas tech wellness", why: "Apps de salud, plataformas de nutrición. Empleados del sector con titulaciones europeas como diferencial." },
                        { name: "Universidades y postgrados", why: "Convenios institucionales para referir alumnos a los Masters ICEN como complemento." },
                      ].map((s, i) => (
                        <div key={i} className="seg-item">
                          <div className="seg-dot-t" />
                          <div className="seg-item-text">
                            <div className="seg-item-name">{s.name}</div>
                            <div className="seg-item-why">{s.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: C.gray, textTransform: "uppercase", marginBottom: 16 }}>Roadmap de activación · 2026</div>
                <div className="roadmap-grid">
                  {[
                    {
                      q: "Q1", sub: "ene–mar", target: "Setup", targetColor: C.blue,
                      items: [
                        "Herramienta BRTHLS → servidores ICEN desplegada",
                        "Scraping Tier 1: ≥5.000 empresas España estructuradas",
                        "Secuencia n8n D0-D21 configurada y probada",
                        "Twenty CRM pipeline B2B separado del B2C",
                        "Templates email y LinkedIn aprobados",
                      ],
                      bar: C.blue
                    },
                    {
                      q: "Q2", sub: "abr–jun", target: "Lanzar", targetColor: C.fundae,
                      items: [
                        "Outreach activo: 500 empresas/mes contactadas",
                        "Primeras 20 empresas con convenio firmado",
                        "FUNDAE: primeras 10 empresas activas",
                        "Primeros 5 embajadores con código activo en CRM",
                        "Scraping Tier 2 y primeros LATAM",
                      ],
                      bar: C.fundae
                    },
                    {
                      q: "Q3", sub: "jul–sep", target: "Escalar", targetColor: C.accent,
                      items: [
                        "60 empresas activas (FUNDAE + Embajadores)",
                        "Activar Tier 3 LATAM: MX, CO, CL",
                        "Corporate deals con 3+ cadenas de gimnasios LATAM",
                        "Renovaciones primer ciclo FUNDAE",
                        "Iteración herramienta según conversión real",
                      ],
                      bar: C.accent
                    },
                    {
                      q: "Q4", sub: "oct–dic", target: "Consolidar", targetColor: C.amber,
                      items: [
                        "100 empresas activas en pipeline",
                        "30+ embajadores activos generando referidos",
                        "Renovación FUNDAE 2027 ya en negociación",
                        "LATAM: pipeline corporativo Q1 2027 construido",
                        "Explorar SENCE/SENA acreditación si viabilidad",
                      ],
                      bar: C.amber
                    },
                  ].map((qr, i) => (
                    <div key={i} className="roadmap-q">
                      <div className="roadmap-q-header">
                        <div>
                          <div className="roadmap-q-name">{qr.q} 2026</div>
                          <div className="roadmap-q-sub">{qr.sub}</div>
                        </div>
                        <div className="roadmap-q-target" style={{ color: qr.targetColor }}>{qr.target}</div>
                      </div>
                      <div className="roadmap-q-body">
                        {qr.items.map((item, j) => (
                          <div key={j} className="roadmap-item">
                            <div className="roadmap-dot" style={{ background: qr.bar }} />
                            <div style={{ color: C.grayLight }}>{item}</div>
                          </div>
                        ))}
                      </div>
                      <div className="roadmap-q-bar" style={{ background: `linear-gradient(90deg, ${qr.bar}, transparent)` }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
