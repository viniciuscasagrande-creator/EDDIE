export interface PdtEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  VERCEL_ENV?: 'production' | 'preview' | 'development';
  API_INTERNAL_URL: string;
  BACKEND_URL: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_PRODUTOR_ID?: string;
  NEXT_PUBLIC_EVENTO_ID?: string;
  TENANT_ID?: string;
  PRODUTOR_ID?: string;
  DEMO_MODE: boolean;
  NEXT_PUBLIC_ALLOW_OFFLINE_MOCK: boolean;
}

export function getPdtEnv(env: Record<string, string | undefined> = process.env): PdtEnv {
  const nodeEnv = (env['NODE_ENV'] as PdtEnv['NODE_ENV']) || 'development';
  const vercelEnv = env['VERCEL_ENV'] as PdtEnv['VERCEL_ENV'] | undefined;
  const isProduction = nodeEnv === 'production' || vercelEnv === 'production';

  const demoModeRaw = env['DEMO_MODE'] === 'true';
  const allowMockRaw = env['NEXT_PUBLIC_ALLOW_OFFLINE_MOCK'] === 'true';

  // REGRA DE OURO: Demo e mock são terminantemente proibidos em produção!
  const demoMode = isProduction ? false : demoModeRaw;
  const allowOfflineMock = isProduction ? false : allowMockRaw;

  return {
    NODE_ENV: nodeEnv,
    VERCEL_ENV: vercelEnv,
    API_INTERNAL_URL: env['API_INTERNAL_URL'] || '',
    BACKEND_URL: env['BACKEND_URL'] || '',
    NEXT_PUBLIC_API_URL: env['NEXT_PUBLIC_API_URL'] || '/api',
    NEXT_PUBLIC_PRODUTOR_ID: env['NEXT_PUBLIC_PRODUTOR_ID'],
    NEXT_PUBLIC_EVENTO_ID: env['NEXT_PUBLIC_EVENTO_ID'],
    TENANT_ID: env['TENANT_ID'],
    PRODUTOR_ID: env['PRODUTOR_ID'],
    DEMO_MODE: demoMode,
    NEXT_PUBLIC_ALLOW_OFFLINE_MOCK: allowOfflineMock,
  };
}
