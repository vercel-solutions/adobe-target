import { NextRequest, NextResponse } from 'next/server';
import { STORE_CLOSED } from 'lib/flags';
import { prefetchMboxes, setTargetCookies } from 'lib/adobe-api';

const flagsMap = {
  default: 'exp-a',
  expA: 'exp-a',
  expB: 'exp-b',
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { href, pathname } = req.nextUrl;

  url.pathname = `/static-rewrites/${flagsMap.default}`;

  try {
    // Prefetching mboxes doens't count as a visit, this is important as we should only
    // count the visit when the page is rendered
    // https://developers.adobetarget.com/api/delivery-api/#section/Prefetch
    const mboxes = await prefetchMboxes({
      cookies: req.cookies,
      body: {
        context: {
          channel: 'web',
          address: {
            url: href,
          },
        },
        prefetch: {
          mboxes: [
            {
              name: STORE_CLOSED,
              index: 1,
            },
          ],
        },
      },
    });

    // console.log('RES', JSON.stringify(mboxes, null, 2));

    const mbox = mboxes.data.prefetch.mboxes[0];
    const option = mbox.options?.[0];

    if (option?.content.enabled) {
      url.pathname = `/static-rewrites/${flagsMap[option.content.flag]}`;
    }

    const res = NextResponse.rewrite(url);

    setTargetCookies(res, mboxes);
    // We save a special cookie for this path, later in the page we sent an event with
    // this cookie to the API
    if (option?.eventToken) {
      res.cookie(`${option.content.flag}-etoken`, option.eventToken, {
        // The token is set to `/static-rewrite`
        path: pathname,
      });
    }

    return res;
  } catch (error) {
    // In the case there's an error with Target, we don't want to crash our app but let the
    // middleware continue and render the default content
    console.error(error);
    // Rewrite to the default page
    return NextResponse.rewrite(url);
  }
}
