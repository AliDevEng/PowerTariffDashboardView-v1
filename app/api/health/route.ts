import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.peakenergy.io';

export async function GET() {
  const key = process.env.PEAK_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, message: 'PEAK_API_KEY is missing on server runtime.' }, { status: 500 });
  }

  try {
    const response = await fetch(`${BASE_URL}/dsos?region=SE&hasPrivateTariffs=yes&hasTariffPowerPrices=yes`, {
      headers: { 'x-api-key': key },
      cache: 'no-store'
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Peak API connectivity failed.',
          statusCode: response.status,
          upstreamMessage: payload?.message ?? null
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Server can access Peak API with current key.',
      sampleStatus: payload?.status ?? null
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unexpected server error while testing Peak API connectivity.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
