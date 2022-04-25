import type { FC } from 'react';
import { Layout } from '@vercel/examples-ui';
import type { LayoutProps } from '@vercel/examples-ui/layout';
import { AdobeAtProvider } from '../lib/use-adobe-at';

const AdobeAtLayout: FC<LayoutProps> = ({ children, ...props }) => (
  <Layout {...props}>
    <AdobeAtProvider>{children}</AdobeAtProvider>
  </Layout>
);

export default AdobeAtLayout;
