import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Page, Text, Link } from '@vercel/examples-ui';
import { STORE_CLOSED } from 'lib/flags';
import { useAdobeAt } from 'lib/use-adobe-at';
import AdobeAtLayout from 'components/adobe-at-layout';

export default function CSRAt() {
  // Target is loaded by `AdobeAtLayout`
  const target = useAdobeAt();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [expValue, setExp] = useState('');

  // Trigger a page view only once when the router is ready.
  // It's better to use Router events for more advanced scenarios:
  // https://nextjs.org/docs/api-reference/next/router#routerevents
  useEffect(() => {
    if (router.isReady && !done && target) {
      setDone(true);

      target.triggerView('/csr/at');
      target.getOffer({
        mbox: STORE_CLOSED,
        timeout: 1000,
        params: {
          a: 1,
          b: 2,
        },
        success(offer) {
          console.log('OFFER', offer);

          offer = offer[0]?.content[0];

          if (offer && offer.enabled) {
            setExp(offer.flag);

            // Not sure if this does something without a DOM selector
            target.applyOffer({ mbox: STORE_CLOSED, offer });
          } else {
            setExp('default');
          }
        },
        error(status, error) {
          console.log('Error:', status, error);
        },
      });
    }
  }, [router.isReady, done, target]);

  return (
    <Page>
      <Text variant="h1" className="mb-6">
        CSR Page with at.js
      </Text>
      <Text className="text-lg mb-4">
        The contents of the text below are loaded based on the variant:
      </Text>
      {expValue === 'expB' ? (
        <Text className="mb-4">
          You&apos;re looking at text selected by the experiment{' '}
          <b>{expValue}</b>
        </Text>
      ) : expValue === 'expA' || expValue === 'default' ? (
        <Text className="mb-4">
          You&apos;re looking at text selected by the experiment{' '}
          <b>{expValue}</b>
        </Text>
      ) : null}
      <Text className="mb-4">
        The text in the page is flickering because the experiment is being
        loaded client side
      </Text>
      <Link href="/">Go back to /</Link>
    </Page>
  );
}

CSRAt.Layout = AdobeAtLayout;
