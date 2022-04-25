import CSRAt from './at';

export default function CSRAtBlocking() {
  return <CSRAt blocking />;
}

// This is the same layout, but Target will be loaded sooner before other JS in the page
const BlockingLayout: typeof CSRAt.Layout = (props) => (
  <CSRAt.Layout {...props} strategy="beforeInteractive">
    {props.children}
  </CSRAt.Layout>
);

CSRAtBlocking.Layout = BlockingLayout;
