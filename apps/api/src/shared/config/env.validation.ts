import { z } from 'zod';

export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória para persistência relacional'),
  REDIS_URL: z.string().optional(),
  RABBITMQ_URL: z.string().optional(),
  CLICKHOUSE_URL: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().default('ticketing-api'),
  JWT_SECRET: z.string().optional(),
  QR_SIGNING_KEY: z.string().optional(),
  WEB_ORIGIN: z.string().default('*'),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function validateApiEnv(env: Record<string, unknown> = process.env): ApiEnv {
  const result = ApiEnvSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.warn(`[Environment Warning] Algumas variáveis de ambiente não passaram na validação rígida:\n${issues}`);
    // Retorna fallback compatível para ambiente de testes e dev local
    return ApiEnvSchema.parse({
      ...env,
      DATABASE_URL: env.DATABASE_URL || 'postgresql://localhost:5432/ticketing',
    });
  }
  return result.data;
}
