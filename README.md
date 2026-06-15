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
- Sync de pago por polling/accion manual, preparado para enviar email al cliente cuando Holded marque pago.

## Variables

Copia `.env.example` a `.env.local` y completa:

- `TWENTY_BASE_URL`
- `TWENTY_API_KEY`
- `HOLDED_BASE_URL`
- `HOLDED_API_KEY`
- `ICEN_EMAIL_WEBHOOK_URL`
- `ICEN_B2B_BASIC_USER`
- `ICEN_B2B_BASIC_PASSWORD`

Sin credenciales, la app funciona en modo demo/dry-run para validar flujo y UI sin tocar datos reales.
Si `ICEN_B2B_BASIC_USER` y `ICEN_B2B_BASIC_PASSWORD` estan definidos, todo el panel y sus APIs quedan protegidos con Basic Auth.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Integraciones

Twenty CRM:

- `GET /api/leads`
- `POST /api/proposals` crea propuesta y, si hay credenciales, oportunidad/tarea/nota.

Holded:

- `POST /api/holded/proforma` crea contacto/proforma o dry-run.
- `GET /api/holded/proforma/:id/download` descarga PDF Holded si existe credencial.
- `POST /api/holded/payment-sync` consulta estado y dispara email al cliente si figura pagado.

Holded API v2 expone contactos, facturas y proformas. Sus webhooks oficiales aparecen como proximamente en la documentacion publica de junio de 2026, por lo que el MVP usa polling/accion manual para detectar pagos.

## Seguridad operativa

- Las claves viven solo en env vars server-side.
- Ventas no necesita acceso a Holded.
- El score del frontend publico se trata como pista; el backend debe recalcular/validar antes de automatizar routing.
- Las propuestas son orientativas hasta validar credito real, limites de coste, cofinanciacion, RLT y plazos FUNDAE.
