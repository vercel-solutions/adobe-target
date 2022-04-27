import { NextResponse } from 'next/server';
import {
  getSessionId,
  getTargetCookie,
  getTargetLocationHintCookie,
  parseTargetCookie,
} from './rest-api-utils';

const client = process.env.TARGET_CLIENT;
const organizationId = process.env.TARGET_ORGANIZATION_ID;

if (!client || !organizationId) {
  throw new Error('Missing env TARGET_CLIENT or TARGET_ORGANIZATION_ID');
}

export async function fetchTargetDeliveryAPI(
  { sessionId }: { sessionId: string },
  body: any
) {
  const url = `https://${client}.tt.omtrdc.net/rest/v1/delivery?client=${client}&sessionId=${sessionId}`;
  let res: Response;

  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Network Error:', error);
    throw error;
  }

  if (res.status === 200) {
    return await res.json();
  }

  throw new Error(`Unexpected status returned by Target: ${res.status}`);
}

export async function prefetchMboxes({
  cookies,
  sessionId,
  body,
}: {
  cookies: Record<string, string>;
  sessionId?: string;
  body: any;
}) {
  sessionId = sessionId || getSessionId(cookies);

  const tntId = parseTargetCookie(cookies);
  const data = await fetchTargetDeliveryAPI(
    { sessionId },
    tntId ? { id: { tntId, ...body.id }, ...body } : body
  );

  return {
    targetCookie: getTargetCookie(sessionId, data.id),
    targetLocationHintCookie: getTargetLocationHintCookie(data.id),
    data,
  };
}

export function setTargetCookies(res: NextResponse, targetResponse: any) {
  const { targetCookie, targetLocationHintCookie } = targetResponse;

  // Set Target cookies
  if (targetCookie?.value) {
    res.cookie(targetCookie.name, targetCookie.value, {
      maxAge: targetCookie.maxAge * 1000,
      path: '/',
    });
  }
  if (targetLocationHintCookie?.value) {
    res.cookie(targetLocationHintCookie.name, targetLocationHintCookie.value, {
      maxAge: targetLocationHintCookie.maxAge * 1000,
      path: '/',
    });
  }
}
