import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Layout, Page, Text, Link, Button, Code } from '@vercel/examples-ui';
import { STORE_CLOSED, CLICKED_BUTTON } from 'lib/flags';
import { sendEvent } from 'lib/adobe-events';

const FLAG = 'expB';
const getEventToken = () => Cookies.get(`${FLAG}-etoken`);

export default function ExpB() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (!done && router.isReady) {
      // Register a page view
      sendEvent({
        mbox: STORE_CLOSED,
        type: 'display',
        eventToken: getEventToken(),
      })
        .then(() => {
          console.log('Page view!');
        })
        .catch(console.error)
        .finally(() => {
          setDone(true);
        });
    }
  }, []);

  const handleClick = async () => {
    await sendEvent({
      mbox: CLICKED_BUTTON,
      type: 'click',
      eventToken: getEventToken(),
    });
    console.log('Event sent!');
  };

  return (
    <Page>
      <Text variant="h1" className="mb-6">
        Static Pages + Middleware Rewrites
      </Text>
      <>
        <Text className="mb-4">
          You&apos;re looking at text selected by the experiment <b>{FLAG}</b>
        </Text>
        <Button
          variant="secondary"
          className="mr-2.5 mb-4"
          onClick={handleClick}
        >
          Send click conversion to Target
        </Button>
      </>
      <Text className="mb-4">
        You're currently on <Code>/static-rewrites</Code> and the page{' '}
        <Code>/static/rewrites/exp-b</Code> is being rendered.
      </Text>
      <Link href="/">Go back to /</Link>
    </Page>
  );
}

ExpB.Layout = Layout;
