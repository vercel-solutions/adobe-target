/**
 * Most of the code here is based on the Node.js SDK implementation of
 * @adobe/target-nodejs-sdk, that we can't directly use in the Edge Environment
 */

export const TARGET_COOKIE = 'mbox';
export const SESSION_ID_COOKIE = 'session';
export const DEVICE_ID_COOKIE = 'PC';
export const LOCATION_HINT_COOKIE = 'mboxEdgeCluster';

const SESSION_ID_MAX_AGE = 1860;
const DEVICE_ID_MAX_AGE = 63244800;
const LOCATION_HINT_MAX_AGE = 1860;

type CookieObj = {
  name: string;
  value: string;
  maxAge?: number;
  expires?: number;
};

export function getSessionId(cookies: Record<string, string>) {
  const sessionId = cookies[SESSION_ID_COOKIE];
  return sessionId || crypto.randomUUID();
}

export function parseTargetCookie(cookies: Record<string, string>) {
  return cookies[TARGET_COOKIE]?.split('|')[1]?.split('#')[1];
}

export function getTargetCookie(
  sessionId: string,
  id: { tntId: string }
): CookieObj {
  const nowInSeconds = Math.ceil(Date.now() / 1000);
  const cookies: CookieObj[] = [];
  const { tntId } = id;

  cookies.push({
    name: SESSION_ID_COOKIE,
    value: sessionId,
    expires: nowInSeconds + SESSION_ID_MAX_AGE,
  });

  if (tntId) {
    cookies.push({
      name: DEVICE_ID_COOKIE,
      value: tntId,
      expires: nowInSeconds + DEVICE_ID_MAX_AGE,
    });
  }

  return createTargetCookie(cookies);
}

export function createTargetCookie(cookies: CookieObj[]) {
  const now = Date.now();
  const maxAge = Math.abs(getMaxExpires(cookies) * 1000 - now);
  const serializedCookies = cookies.map((x) => serializeCookie(x));

  return {
    name: TARGET_COOKIE,
    value: serializedCookies.join('|'),
    maxAge: Math.ceil(maxAge / 1000),
  };
}

export function getTargetLocationHintCookie(id: { tntId: string }): CookieObj {
  // Gets the cluster from the tntId, this is not how the SDK does it so this might be wrong
  const cluster = id.tntId.match(/.+\.(.+)_/)[1];

  return {
    name: LOCATION_HINT_COOKIE,
    value: cluster,
    maxAge: LOCATION_HINT_MAX_AGE,
  };
}

function getMaxExpires(cookies: CookieObj[]) {
  return Math.max(...cookies.map((cookie) => cookie.expires));
}

function serializeCookie(cookie: CookieObj) {
  return [
    encodeURIComponent(cookie.name),
    encodeURIComponent(cookie.value),
    cookie.expires,
  ].join('#');
}
