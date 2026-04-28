// app/api/proxy/[...path]/route.js
import { NextResponse } from 'next/server';

const LAMBDA_URL = 'https://wutcdbj6wt3yww43qio7wvfjea0ajodn.lambda-url.eu-north-1.on.aws';

export async function GET(request, { params }) {
  const { path } = await params;
  const apiPath = path.join('/');
  const url = `${LAMBDA_URL}/api/${apiPath}${request.nextUrl.search}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request, { params }) {
  const { path } = await params;
  const apiPath = path.join('/');
  const url = `${LAMBDA_URL}/api/${apiPath}`;
  const body = await request.json();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// Ajoutez PUT, DELETE, etc. si nécessaire
export async function PUT(request, { params }) { /* similaire */ }
export async function DELETE(request, { params }) { /* similaire */ }