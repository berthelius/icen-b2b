# Monitor de pagos FUNDAE

Objetivo: ventas crea propuesta/proforma, pero no opera Holded ni escribe al cliente al detectar cobro. El backend revisa pagos y avisa a contabilidad.

## Endpoint

`GET|POST /api/holded/payment-monitor`

Cabecera opcional para automatizaciones:

```http
x-icen-monitor-token: $ICEN_PAYMENT_MONITOR_TOKEN
```

Si `ICEN_PAYMENT_MONITOR_TOKEN` esta configurado, el endpoint rechaza llamadas sin token. El `proxy.js` tambien permite esta cabecera para que n8n/cron pueda entrar aunque el panel tenga Basic Auth.

## Flujo

1. Lee propuestas persistidas en `data/sales-backend.json`.
2. Filtra proformas Holded pendientes y no dry-run.
3. Consulta `GET /api/v2/proformas/:id` en Holded.
4. Si detecta pago, envia aviso interno a `ICEN_ACCOUNTING_EMAIL`.
5. Marca `paymentNotifiedAt` para evitar duplicados.
6. Deja nota en Twenty CRM si `TWENTY_API_KEY` esta configurado.

## n8n recomendado

- Schedule Trigger cada 30 minutos en horario comercial.
- HTTP Request `POST https://<backend>/api/holded/payment-monitor`.
- Header `x-icen-monitor-token`.
- `continueOnFail: true`.
- Timezone `Europe/Madrid`.
- Resumen interno solo si `paid > 0` o hay errores.

No usar webhook de Holded hasta que este disponible oficialmente; la documentacion publica de Holded mantiene webhooks como "Coming soon".
