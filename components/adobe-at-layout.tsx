import type { FC } from 'react';
import type { ScriptProps } from 'next/script';
import { Layout } from '@vercel/examples-ui';
import type { LayoutProps } from '@vercel/examples-ui/layout';
import { AdobeAtProvider } from '../lib/use-adobe-at';

const AdobeAtLayout: FC<
  LayoutProps & { strategy: ScriptProps['strategy'] }
> = ({ children, strategy, ...props }) => (
  <Layout {...props}>
    <AdobeAtProvider strategy={strategy}>{children}</AdobeAtProvider>
  </Layout>
);

export default AdobeAtLayout;
