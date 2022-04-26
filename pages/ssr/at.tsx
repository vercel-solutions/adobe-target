import { useState, useEffect } from 'react';
import type { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { Page, Text, Link, Button } from '@vercel/examples-ui';
import { getAttributesFromReq } from 'lib/adobe-client';
import { useAdobeAt } from 'lib/use-adobe-at';
import { CLICKED_BUTTON, STORE_CLOSED } from 'lib/flags';
import AdobeAtLayout from 'components/adobe-at-layout';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const attrs = await getAttributesFromReq(req, res, [STORE_CLOSED]);
  const featureFlag = attrs.asObject(STORE_CLOSED);

  return {
    props: featureFlag.enabled
      ? { flag: { name: featureFlag.flag, enabled: true } }
      : {},
  };
}

export default function SSRAt({ flag }) {
  const router = useRouter();
  const target = useAdobeAt();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (!done && router.isReady && target && flag) {
      setDone(true);

      // https://experienceleague.adobe.com/docs/target/using/implement-target/client-side/at-js-implementation/functions-overview/adobe-target-triggerview-atjs-2.html?lang=en
      target.triggerView('/ssr/at');

      if (flag) {
        // https://experienceleague.adobe.com/docs/target/using/implement-target/client-side/at-js-implementation/functions-overview/adobe.target.sendnotifications-atjs-21.html?lang=en
        // Something like this can work too, but `target.getAttributes` takes care of
        // registering the initial impression
        // target.sendNotifications({
        //   request: {
        //     notifications: [
        //       ...
        //     ],
        //   },
        // });
      }
    }
  }, [target, flag]);

  const expValue = flag?.enabled ? flag.name : 'default';

  const handleClick = () => {
    // https://experienceleague.adobe.com/docs/target/using/implement-target/client-side/at-js-implementation/functions-overview/adobe-target-trackevent.html?lang=en
    // Q: how do we relate the event to the offer?
    target.trackEvent({
      mbox: CLICKED_BUTTON,
      type: 'click',
      success() {
        console.log('Event tracked!');
      },
      error(status, error) {
        console.log('Error:', status, error);
      },
    });
  };

  return (
    <Page>
      <Text variant="h1" className="mb-6">
        SSR Page with at.js
      </Text>
      {expValue === 'expA' || expValue === 'default' ? (
        <>
          <Text className="mb-4">
            You&apos;re looking at text selected by the experiment{' '}
            <b>{expValue}</b>. This is also the default content if Target fails
            to load.
          </Text>
          <Button
            variant="secondary"
            className="mr-2.5 mb-4"
            onClick={handleClick}
          >
            Send click conversion to Target
          </Button>
        </>
      ) : expValue === 'expB' ? (
        <>
          <Text className="mb-4">
            You&apos;re looking at text selected by the experiment{' '}
            <b>{expValue}</b>
          </Text>
          <Button
            variant="secondary"
            className="mr-2.5 mb-4"
            onClick={handleClick}
          >
            Send click conversion to Target
          </Button>
        </>
      ) : null}
      <Text className="mb-4">
        The page is being server-rendered, no flickering will occur at the cost
        of running a serverless function
      </Text>
      <Link href="/">Go back to /</Link>
    </Page>
  );
}

SSRAt.Layout = AdobeAtLayout;
