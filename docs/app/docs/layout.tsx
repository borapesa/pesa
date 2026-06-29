import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <>
            <img src="/borapesa.svg" alt="Bora Pesa" width={32} height={32} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Bora Pesa</span>
          </>
        ),
      }}
      githubUrl="https://github.com/borapesa/pesa"
      sidebar={{
        collapsible: true,
      }}
    >
      {children}
    </DocsLayout>
  );
}
