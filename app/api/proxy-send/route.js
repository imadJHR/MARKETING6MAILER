// app/api/proxy-send/route.js
import { NextResponse } from 'next/server';

const LAMBDA_URL = 'https://wutcdbj6wt3yww43qio7wvfjea0ajodn.lambda-url.eu-north-1.on.aws';

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    const response = await fetch(`${LAMBDA_URL}/api/campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}