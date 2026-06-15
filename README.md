# ICEN B2B · Ventas FUNDAE

Backend interno para closers: ver leads, calcular credito FUNDAE, seleccionar modulos, generar propuesta, crear proforma en Holded, descargar documento y registrar seguimiento en CRM.

## Funcionalidad

- Dashboard de leads hot, pendientes, sin contactar y propuestas.
- Cola de leads desde Twenty CRM o datos demo si faltan credenciales.
- Calculadora FUNDAE backend: credito, cotizacion, tramo y cofinanciacion.
- Generador de propuesta a medida con catalogo modular ICEN.
- Registro de oportunidad, tarea y nota en Twenty CRM.
- Creacion de proforma Holded desde backend, sin acceso directo de ventas a Holded.
- Descarga local de propuesta HTML y endpoint de descarga PDF Holded cuando haya credenciales.
- Persistencia operativa de propuestas, proformas y checks de pago en store server-side.
- Sync de pago por polling/accion manual: cuando Holded marque pagado, avisa a contabilidad y deja nota CRM. No envia email al cliente desde ventas.
- Monitor programable de pagos para que n8n/cron revise proformas pendientes.

## Variables

Copia `.env.example` a `.env.local` y completa:

- `TWENTY_BASE_URL`
- `TWENTY_API_KEY`
- `HOLDED_BASE_URL`
- `HOLDED_API_KEY`
- `ICEN_EMAIL_WEBHOOK_URL`
- `ICEN_ACCOUNTING_WEBHOOK_URL`
- `ICEN_ACCOUNTING_EMAIL`
- `ICEN_EMAIL_FROM`
- `ICEN_B2B_BASIC_USER`
- `ICEN_B2B_BASIC_PASSWORD`
- `ICEN_PAYMENT_MONITOR_TOKEN`

Sin credenciales, la app funciona en modo demo/dry-run para validar flujo y UI sin tocar datos reales.
Si `ICEN_B2B_BASIC_USER` y `ICEN_B2B_BASIC_PASSWORD` estan definidos, todo el panel y sus APIs quedan protegidos con Basic Auth.
El store local vive en `data/sales-backend.json`; en despliegue self-hosted, monta `data/` como volumen persistente. En Vercel/serverless conviene migrar este store a base de datos.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.
Guia del monitor de pagos: `docs/payment-monitor.md`.

## Integraciones

Twenty CRM:

- `GET /api/leads`
- `GET /api/proposals` lista propuestas persistidas.
- `POST /api/proposals` crea propuesta y, si hay credenciales, oportunidad/tarea/nota.
- `PATCH /api/proposals/:id/status` actualiza estado `draft`, `sent`, `accepted` o `lost` y deja nota CRM.

Holded:

- `POST /api/holded/proforma` crea contacto/proforma o dry-run.
- `GET /api/holded/proforma/:id/download` descarga PDF Holded si existe credencial.
- `POST /api/holded/payment-sync` consulta estado de una proforma y avisa a contabilidad si figura pagada.
- `GET|POST /api/holded/payment-monitor` recorre proformas pendientes persistidas y aplica el mismo flujo de aviso. Para cron/n8n usa `x-icen-monitor-token: $ICEN_PAYMENT_MONITOR_TOKEN` si el token esta configurado.

Holded API v2 expone contactos, facturas y proformas. Sus webhooks oficiales aparecen como proximamente en la documentacion publica de junio de 2026, por lo que el MVP usa polling/accion manual o monitor programado para detectar pagos.

## Seguridad operativa

- Las claves viven solo en env vars server-side.
- Ventas no necesita acceso a Holded.
- Ventas no envia confirmaciones de pago al cliente desde este backend; el pago solo dispara aviso interno a contabilidad.
- El score del frontend publico se trata como pista; el backend debe recalcular/validar antes de automatizar routing.
- Las propuestas son orientativas hasta validar credito real, limites de coste, cofinanciacion, RLT y plazos FUNDAE.
- El store local puede contener datos personales de leads. Debe vivir en disco persistente privado, no versionarse y rotarse/depurarse segun politica interna.
