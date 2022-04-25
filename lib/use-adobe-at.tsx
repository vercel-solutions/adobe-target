import { FC, createContext, useContext, useState, useEffect } from 'react';
import Script from 'next/script';

const adobeAtContext = createContext<any>(undefined);

export const AdobeAtProvider: FC = ({ children }) => {
  const [client, setClient] = useState();

  return (
    <adobeAtContext.Provider value={client}>
      <Script
        src="/at.js"
        onLoad={() => {
          setClient((window as any).adobe.target);
        }}
      />
      {children}
    </adobeAtContext.Provider>
  );
};

export const useAdobeAt = () => useContext(adobeAtContext);
