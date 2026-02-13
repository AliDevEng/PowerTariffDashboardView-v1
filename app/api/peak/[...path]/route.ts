import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://api.peakenergy.io';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const key = process.env.PEAK_API_KEY;
  if (!key) {
    return NextResponse.json({ status: 'error', message: 'Server API key is missing.' }, { status: 500 });
  }

  const path = params.path.join('/');
  const search = request.nextUrl.search;
  const target = `${BASE_URL}/${path}${search}`;

  const response = await fetch(target, { headers: { 'x-api-key': key }, next: { revalidate: 60 * 20 } });
  if (!response.ok) {
    return NextResponse.json({ status: 'error', message: 'Upstream request failed.' }, { status: response.status });
  }

  const payload = await response.json();
  return NextResponse.json({ status: payload.status, data: payload.data, pagination: payload.pagination });
}
