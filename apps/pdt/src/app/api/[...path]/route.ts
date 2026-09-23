import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function backendBase() {
  const raw = process.env.API_INTERNAL_URL || process.env.BACKEND_URL || process.env.API_URL || "";
  if (!raw || !/^https?:\/\//i.test(raw)) return "";
  const clean = raw.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>) {
  const base = backendBase();
  if (!base || !base.startsWith("http")) {
    return NextResponse.json(
      {
        error: "API_BACKEND_NAO_CONFIGURADA",
        message: "Configure API_INTERNAL_URL no ambiente de produção com a URL do backend real.",
      },
      { status: 503 }
    );
  }
  const { path } = await params;
  const target = `${base}/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");
  // EDDIE 11.1: contexto server-side acompanha todas as chamadas ao backend.
  const tenantId = process.env.TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || "";
  const produtorId = process.env.PRODUTOR_ID || process.env.NEXT_PUBLIC_PRODUTOR_ID || "";
  if (tenantId && !headers.has("x-tenant-id")) headers.set("x-tenant-id", tenantId);
  if (produtorId) {
    if (!headers.has("x-producer-id")) headers.set("x-producer-id", produtorId);
    if (!headers.has("x-produtor-id")) headers.set("x-produtor-id", produtorId);
  }
  const abortCtrl = new AbortController();
  const abortTimer = setTimeout(() => abortCtrl.abort(), 5000);
  try {
    const init: RequestInit = { method: req.method, headers, cache: "no-store", signal: abortCtrl.signal };
    if (!["GET", "HEAD"].includes(req.method)) init.body = await req.arrayBuffer();
    const upstream = await fetch(target, init);
    clearTimeout(abortTimer);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    clearTimeout(abortTimer);
    return NextResponse.json(
      { error: "API_BACKEND_INDISPONIVEL", message: "Não foi possível conectar à API operacional." },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxy(req, ctx.params); }
