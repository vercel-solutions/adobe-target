import { FC, createContext, useContext, useState, useEffect } from 'react';
import Script, { ScriptProps } from 'next/script';

const adobeAtContext = createContext<any>(undefined);

export const AdobeAtProvider: FC<ScriptProps> = ({ children, ...props }) => {
  const [client, setClient] = useState();
  const w: any = typeof window === 'undefined' ? {} : window;

  // When the Adobe client is loaded with the `beforeInteractive` strategy we
  // assume the Adobe Target client is ready to be used when `useEffect` runs
  useEffect(() => {
    if (props.strategy === 'beforeInteractive' && w.adobe) {
      setClient(w.adobe.target);
    }
  }, [props.strategy, w.adobe]);

  return (
    <adobeAtContext.Provider value={client}>
      <Script
        src="/at.js"
        id="adobe-target"
        // onLoad doesn't work when using `beforeInteractive` but if we used the default
        // strategy (`afterInteractive`) it would and it could be used instead of `useEffect`
        onLoad={(e) => {
          setClient(w.adobe.target);
          props.onLoad?.(e);
        }}
        {...props}
      />
      {children}
    </adobeAtContext.Provider>
  );
};

export const useAdobeAt = () => useContext(adobeAtContext);
