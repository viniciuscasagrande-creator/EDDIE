import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

/**
 * Base do módulo Developer: tudo (HTTP, Prisma, Redis, AMQP) é instrumentado
 * automaticamente. O correlationId dos eventos é propagado como traceId, então
 * dá para seguir um pedidoId atravessando todos os módulos.
 */
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'}/v1/traces`,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();
process.on('SIGTERM', () => void sdk.shutdown());
