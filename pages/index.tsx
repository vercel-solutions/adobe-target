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
          <Link href="/ssg">
            /ssg: SSG + Middleware Rewrites, events are sent using API Routes
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
            /ssr: SSR Page where events are sent using API Routes
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
          The difference between <Code>/static-rewrites</Code> and{' '}
          <Code>/ssg</Code> is only that the latter is using dynamic routes over
          predefined pages
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
      <Text className="mb-4">
        There are also measurable differences in performance between CSR, SSR,
        and Static + Middleware rewrites, the links below are using{' '}
        <Link href="https://lighthouse-metrics.com/" target="_blank">
          Lighthouse Metrics
        </Link>
        :
      </Text>
      <List className="mb-4">
        <li className="mb-2.5">
          <Link
            href="https://lighthouse-metrics.com/lighthouse/checks/8526dc2c-9342-4853-9ff5-2c0ea3ba9286"
            target="_blank"
          >
            Static + Middleware rewrites (/static-rewrites)
          </Link>
        </li>
        <li className="mb-2.5">
          <Link
            href="https://lighthouse-metrics.com/lighthouse/checks/3d9f0a89-cfbe-45bd-b410-b6600d25a4b5"
            target="_blank"
          >
            CSR + at.js (/csr/at)
          </Link>
        </li>
        <li className="mb-2.5">
          <Link
            href="https://lighthouse-metrics.com/lighthouse/checks/dcc840eb-2238-4b08-8fda-e9d5f96ed9fd"
            target="_blank"
          >
            CSR + at.js blocking (/csr/at-blocking)
          </Link>
        </li>
        <li className="mb-2.5">
          <Link
            href="https://lighthouse-metrics.com/lighthouse/checks/654d8160-0ddd-4c09-b861-1d79e897ab20"
            target="_blank"
          >
            SSR + at.js (/ssr/at)
          </Link>
        </li>
      </List>
      <Text className="mb-4">
        Based on the lighthouse results above, we can conclude the following:
      </Text>
      <List className="mb-4">
        <li className="mb-2.5">
          Static + Middleware rewrites scores better CWV (Core Web Vitals - LCP,
          TTI, TBT) results than other pages, this is due to it being completely
          static and not using <Code>at.js</Code>, while still being able to
          handle per request experimentation
        </li>
        <li className="mb-2.5">
          The blocking behavior of <Code>/csr/at-blocking</Code> gives it worse
          performance over
          <Code>/csr/at</Code>
        </li>
        <li className="mb-2.5">
          <Code>/ssr/at</Code> has better performance than{' '}
          <Code>/csr/at-blocking</Code> even though it has to wait for the page
          to be generated by a serverless function. This has to do with the
          performance hit introduced by waiting on <Code>at.js</Code> and
          blocking the paint of the page until the experiment is ready
        </li>
        <li className="mb-2.5">
          The difference between <Code>/ssr/at</Code> and <Code>/csr/at</Code>{' '}
          is less noticeable, in this case case it's more of a tradeoff, CSR
          paints faster but it has a layout shift while the experiment loads,
          SSR loads with the experiment ready but it's a serverless function and
          can't be cached globally if it depends on request data
        </li>
      </List>
    </Page>
  );
}

Index.Layout = Layout;
