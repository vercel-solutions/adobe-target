import { Layout, Page, Text, List, Link, Code } from '@vercel/examples-ui';

export default function Index() {
  return (
    <Page>
      <Text variant="h1" className="mb-6">
        AB testing with Adobe Target
      </Text>
      <Text className="mb-4">
        The demo showcases multiple ways in which Adobe Target can be used in
        Next.js pages, using different data fetching and rendering strategies:
      </Text>
      <List className="mb-4">
        <li className="mb-2.5">
          <Link href="/static-rewrites">
            /static-rewrites: Static Pages + Middleware Rewrites, events are
            sent using API Routes
          </Link>
        </li>
        <li className="mb-2.5">
          <Link href="/csr/at">/csr/at: CSR Page with at.js</Link>
        </li>
        <li className="mb-2.5">
          <Link href="/csr/at-blocking">
            /csr/at-blocking: CSR Page with at.js blocking rendering until
            experiment is ready
          </Link>
        </li>
        <li className="mb-2.5">
          <Link href="/ssr/at">/ssr/at: SSR Page with at.js</Link>
        </li>
        <li className="mb-2.5">
          <Link href="/ssr">
            /ssr/at: SSR Page where events are sent using API Routes
          </Link>
        </li>
      </List>
      <Text className="mb-4">The differences between the pages are:</Text>
      <List className="mb-4">
        <li className="mb-2.5">
          Pages under Next.js Middleware take advantage of the{' '}
          <Link
            href="https://vercel.com/docs/concepts/edge-network/overview"
            target="_blank"
          >
            Vercel Edge Network
          </Link>
          , rewrites should be very fast if the request hits the{' '}
          <Link
            href="https://experienceleague.adobe.com/docs/target/using/introduction/how-target-works.html?lang=en"
            target="_blank"
          >
            Target Edge Network
          </Link>
        </li>
        <li className="mb-2.5">
          Pages that have <Code>at.js</Code> will have a larger JS footprint as
          it takes <b>33.7kb</b> to load it.
        </li>
        <li className="mb-2.5">
          If the page is blocking until the experiment is ready, like in{' '}
          <Code>/csr/at-blocking</Code> or <Code>/ssr</Code>, TTFB and FCP are
          worse than in non-blocking pages
        </li>
        <li className="mb-2.5">
          Pages that call an API route instead of using <Code>at.js</Code> are
          less likely to get adblocked because the API routes live in the same
          domain. The API route takes more time to send an event as it's an
          intermediary, but analytics reporting shouldn't be affecting
          performance
        </li>
      </List>
    </Page>
  );
}

Index.Layout = Layout;
