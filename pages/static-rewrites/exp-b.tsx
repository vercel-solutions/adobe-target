import { Layout, Page, Text, Link, Button, Code } from '@vercel/examples-ui';
import { CLICKED_BUTTON } from 'lib/flags';

const FLAG = 'expB';

export default function ExpB() {
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
