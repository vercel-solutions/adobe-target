import type { IncomingMessage, ServerResponse } from 'http';
import targetClient from '@adobe/target-nodejs-sdk';
import cookie from 'cookie';

// We save the client here to avoid creating it multiple times on
// calls to the same serverless function.
let _client: any;

export default async function getTargetClient() {
  if (_client) return _client;

  return new Promise((resolve, reject) => {
    const client = process.env.TARGET_CLIENT;
    const organizationId = process.env.TARGET_ORGANIZATION_ID;

    if (!client || !organizationId) {
      return reject(
        new Error('Missing env TARGET_CLIENT or TARGET_ORGANIZATION_ID')
      );
    }

    let artifactDownloaded = false;
    const config = {
      client,
      organizationId,
      decisioningMethod: 'on-device',
      // This is the SDK's default
      timeout: 3000,
      // Enables login
      // logger: console,
      events: {
        artifactDownloadSucceeded: onArtifactDownloadSucceeded,
        artifactDownloadFailed: onArtifactDownloadFailed,
        clientReady: targetClientReady,
      },
    };

    function targetClientReady() {
      if (!artifactDownloaded) {
        return reject(
          new Error(
            'The client is ready but no artifacts were loaded, this most likely means there are no published activities in Target.'
          )
        );
      }
      _client = target;
      resolve(_client);
    }
    /**
     * In the case that the artifact download succeeds or fails, the `event` object includes:
     *
     * `event.artifactLocation`: Location from where the Artifact is downloaded.
     * `event.artifactName`: Name of the Artifact.
     */
    function onArtifactDownloadSucceeded(event) {
      artifactDownloaded = true;
    }
    function onArtifactDownloadFailed(event) {
      console.error('Artifact download failed:', event);
    }

    // The client downloads the rule artifact, so we create it once for it
    // to use the memory cache of serverless functions.
    const target = targetClient.create(config);
  });
}

export const getCookies = (cookies: Record<string, string>) => ({
  targetCookie: cookies[encodeURIComponent(targetClient.TargetCookieName)],
  targetLocationHintCookie:
    cookies[encodeURIComponent(targetClient.TargetLocationHintCookieName)],
});

function setTargetCookies(res: ServerResponse, targetResponse: any) {
  const { targetCookie, targetLocationHintCookie } = targetResponse;

  // Set Target cookies
  res.setHeader(
    'Set-Cookie',
    [
      cookie.serialize(targetCookie.name, targetCookie.value, {
        maxAge: targetCookie.maxAge,
        path: '/',
      }),
      cookie.serialize(
        targetLocationHintCookie.name,
        targetLocationHintCookie.value,
        {
          maxAge: targetLocationHintCookie.maxAge,
          path: '/',
        }
      ),
    ].filter(Boolean)
  );
}

export async function getAttributesFromReq(
  req: IncomingMessage & { cookies?: Record<string, string> },
  res: ServerResponse,
  ...args: any[]
) {
  const target = await getTargetClient();
  const options = getCookies(
    req.cookies || cookie.parse(req.headers.cookie || '')
  );
  // This method triggers an impression:
  // https://adobetarget-sdks.gitbook.io/docs/core-principles/event-tracking#how-impressions-are-triggered
  const attrs = await target.getAttributes(...args, options);
  const response = attrs.getResponse();

  setTargetCookies(res, response);

  return attrs;
}

export async function getOffers(
  req: IncomingMessage & { cookies?: Record<string, string> },
  res: ServerResponse,
  options: Record<string, any>
) {
  const target = await getTargetClient();
  const cookieOptions = getCookies(
    req.cookies || cookie.parse(req.headers.cookie || '')
  );
  // This method triggers an impression:
  // https://adobetarget-sdks.gitbook.io/docs/core-principles/event-tracking#how-impressions-are-triggered
  const response = await target.getOffers({ ...cookieOptions, ...options });

  setTargetCookies(res, response);

  return response;
}

export async function sendNotifications(
  // req: IncomingMessage & { cookies?: Record<string, string> },
  // res: ServerResponse,
  options: Record<string, any>
) {
  const target = await getTargetClient();
  return target.sendNotifications(options);
}
