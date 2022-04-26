import { useState, useEffect } from 'react';
import type { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { Layout, Page, Text, Link, Button } from '@vercel/examples-ui';
import { getAttributesFromReq } from 'lib/adobe-client';
import { STORE_CLOSED, CLICKED_BUTTON } from 'lib/flags';

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
  const [done, setDone] = useState(false);
  const expValue = flag?.enabled ? flag.name : 'default';

  useEffect(() => {
    if (done) return;
    if (!done && router.isReady && flag) {
      setDone(true);
    }
  }, [flag]);

  const handleClick = async () => {
    await fetch('/api/target/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mbox: CLICKED_BUTTON,
        type: 'click',
      }),
    });
    console.log('Event sent!');
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

SSRAt.Layout = Layout;
