import crypto from 'crypto';
import { getCookies, getOffers, sendNotifications } from 'lib/adobe-client';
import type { NextApiRequest, NextApiResponse } from 'next';

// Write an API route that uses the Target client
// to get an offer and click on that offer.
export default async function event(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // Do a check to make sure that only users that have rendered a page
  // and have the target cookie can use this endpoint.
  if (!getCookies(req.cookies).targetCookie) {
    return res.status(401).send('Missing target cookie');
  }

  const { mbox, type } = req.body;

  if (!mbox || type !== 'click') {
    return res.status(400).end();
  }

  // This is mostly an implementation of the example in the SDK docs:
  // https://adobetarget-sdks.gitbook.io/docs/core-principles/event-tracking#clicked-an-mbox
  const targetResult = await getOffers(req, res, {
    request: {
      prefetch: {
        mboxes: [
          {
            name: mbox,
            index: 1,
          },
        ],
      },
    },
    sessionId: crypto.randomUUID(),
  });
  const { mboxes = [] } = targetResult.response.prefetch;
  const request = {
    context: { channel: 'web' },
    notifications: mboxes.map((mbox) => {
      const { options = [], metrics = [] } = mbox;
      return {
        id: targetResult.response.id,
        impressionId: crypto.randomUUID(),
        address: {
          url: req.headers.host,
        },
        timestamp: Date.now(),
        type,
        mbox: { name: mbox.name },
        tokens: metrics
          .filter((metric: any) => metric.type === 'click')
          .map((metric: any) => metric.eventToken),
      };
    }),
  };

  // send the notification event
  // Note: this currently fails with "Error: Notifications array is required in request" but
  // that's not clear enough as request.notifications is an array of objects.
  await sendNotifications({ request }).catch((e) => console.log('OMG', e));

  res.status(200).json({ done: true });
}
