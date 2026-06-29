import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import SearchDialog from '@/components/search';
import './global.css';
import 'fumadocs-ui/style.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://borapesa.dev'),
  icons: {
    icon: '/borapesa.svg',
    shortcut: '/borapesa.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider
          search={{
            SearchDialog,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
