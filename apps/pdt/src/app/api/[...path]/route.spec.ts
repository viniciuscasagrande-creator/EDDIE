import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';

describe('PDT Proxy Route (/api/[...path]) - Fail-Fast & Anti-Mock Integrity', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.API_INTERNAL_URL;
    delete process.env.BACKEND_URL;
    delete process.env.API_URL;
    delete process.env.DEMO_MODE;
    delete process.env.NEXT_PUBLIC_ALLOW_OFFLINE_MOCK;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('deve REJEITAR mutações (POST/PUT/DELETE) com HTTP 503 quando backend não está configurado (NUNCA fingir {ok: true})', async () => {
    const req = new NextRequest('http://localhost:3000/api/financeiro/repasses', {
      method: 'POST',
      body: JSON.stringify({ repasseId: '123' }),
    });

    const res = await POST(req, { params: Promise.resolve({ path: ['financeiro', 'repasses'] }) });
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Service Unavailable');
    expect(body.message).toContain('rejeitada');
    expect(res.headers.get('x-data-source')).toBe('unconfigured-backend');
  });

  it('deve REJEITAR leituras (GET) com HTTP 503 quando backend não está configurado e DEMO_MODE está desativado', async () => {
    const req = new NextRequest('http://localhost:3000/api/eventos');
    const res = await GET(req, { params: Promise.resolve({ path: ['eventos'] }) });
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Service Unavailable');
    expect(body.message).toContain('DEMO_MODE=true');
  });

  it('deve permitir dados mockados em GET SOMENTE quando DEMO_MODE=true, injetando header x-data-source: mock', async () => {
    process.env.DEMO_MODE = 'true';

    const req = new NextRequest('http://localhost:3000/api/eventos/produtor/prod-01');
    const res = await GET(req, { params: Promise.resolve({ path: ['eventos', 'produtor', 'prod-01'] }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-data-source')).toBe('mock');

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].nome).toBe('Festival DiskIngressos Live 2026');
  });

  it('MESMO com DEMO_MODE=true, NUNCA deve fingir sucesso em mutações (POST/PUT/DELETE) sem backend', async () => {
    process.env.DEMO_MODE = 'true';

    const req = new NextRequest('http://localhost:3000/api/estorno/aprovar', {
      method: 'POST',
      body: JSON.stringify({ estornoId: 'est-01' }),
    });

    const res = await POST(req, { params: Promise.resolve({ path: ['estorno', 'aprovar'] }) });
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Service Unavailable');
    expect(body.message).toContain('rejeitada');
  });

  it('deve REPASSAR erros 500 do upstream backend (FAIL-FAST) sem engolir ou fingir sucesso', async () => {
    process.env.API_INTERNAL_URL = 'http://api.backend.local';

    const mockFetch = vi.fn().mockResolvedValue({
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: 'Internal Server Error no NestJS' })));
          controller.close();
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new NextRequest('http://localhost:3000/api/eventos/evento-1/relatorios');
    const res = await GET(req, { params: Promise.resolve({ path: ['eventos', 'evento-1', 'relatorios'] }) });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal Server Error no NestJS');
  });

  it('deve retornar 504 em caso de timeout de rede para mutações sem fallback mock', async () => {
    process.env.API_INTERNAL_URL = 'http://api.backend.local';

    const mockFetch = vi.fn().mockImplementation(() => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new NextRequest('http://localhost:3000/api/financeiro/repasses', {
      method: 'POST',
      body: JSON.stringify({ repasseId: '123' }),
    });

    const res = await POST(req, { params: Promise.resolve({ path: ['financeiro', 'repasses'] }) });
    expect(res.status).toBe(504);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Gateway Timeout');
    expect(res.headers.get('x-data-source')).toBe('upstream-failure');
  });

  it('PRODUÇÃO: deve PROIBIR terminantemente dados mockados quando NODE_ENV=production, mesmo se DEMO_MODE=true', async () => {
    (process.env as Record<string, string>)['NODE_ENV'] = 'production';
    process.env.DEMO_MODE = 'true';

    const req = new NextRequest('http://localhost:3000/api/eventos');
    const res = await GET(req, { params: Promise.resolve({ path: ['eventos'] }) });

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe('BACKEND_UNAVAILABLE');
    expect(res.headers.get('x-data-source')).toBe('unconfigured-backend');
  });

  it('deve injetar e propagar correlationId nos cabeçalhos e no corpo das respostas de erro', async () => {
    const customCorr = 'req-trace-uuid-12345';
    const req = new NextRequest('http://localhost:3000/api/eventos', {
      headers: { 'x-correlation-id': customCorr },
    });

    const res = await GET(req, { params: Promise.resolve({ path: ['eventos'] }) });
    expect(res.headers.get('x-correlation-id')).toBe(customCorr);

    const body = await res.json();
    expect(body.correlationId).toBe(customCorr);
    expect(body.code).toBe('BACKEND_UNAVAILABLE');
  });
});
