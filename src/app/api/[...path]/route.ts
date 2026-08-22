import { NextResponse } from 'next/server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function normalizeBase(value: string) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function getBackendBase() {
  return normalizeBase(
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
}

function copyRequestHeaders(request: Request) {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });
  return headers;
}

async function proxy(request: Request, path: string[]) {
  const backendBase = getBackendBase();
  if (!backendBase) {
    return NextResponse.json(
      {
        error:
          'Backend API is not configured. Set BACKEND_API_URL (or NEXT_PUBLIC_API_BASE_URL) in the production deployment.',
      },
      { status: 503 }
    );
  }

  const backendRoot = backendBase.endsWith('/api')
    ? backendBase
    : `${backendBase}/api`;
  const target = `${backendRoot}/${path.map(encodeURIComponent).join('/')}${new URL(request.url).search}`;

  try {
    const method = request.method.toUpperCase();
    const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.arrayBuffer();

    const response = await fetch(target, {
      method,
      headers: copyRequestHeaders(request),
      body,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Backend API is unreachable.', detail: error?.message || 'Unknown proxy error' },
      { status: 502 }
    );
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path || []);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path || []);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path || []);
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path || []);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path || []);
}
