import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { CopyButton } from './copy-button';

export const metadata: Metadata = {
  title: 'Bora Pesa',
  description: 'The unified, open-source payments SDK for Tanzania — one API, all providers.',
  openGraph: {
    siteName: 'Bora Pesa',
    title: 'Bora Pesa',
    description: 'The unified, open-source payments SDK for Tanzania — one API, all providers.',
    images: [{ url: '/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bora Pesa',
    description: 'The unified, open-source payments SDK for Tanzania — one API, all providers.',
    images: ['/og'],
  },
};

const features = [
  {
    title: 'Provider-agnostic',
    desc: 'Swap Selcom for ClickPesa with a one-line config change. No provider-specific code in your app.',
  },
  {
    title: 'TypeScript-first',
    desc: 'Fully typed contracts. Zero any in public APIs. Autocomplete in your editor for every method.',
  },
  {
    title: 'Zero-config defaults',
    desc: 'SQLite event store, BogusProvider for local dev. No infrastructure required to get started.',
  },
];

const providers = [
  {
    name: 'AzamPay',
    logo: '/azampay.png',
    href: '/docs/api/azampay',
    bg: '#ffffff',
  },
  {
    name: 'ClickPesa',
    logo: '/clickpesa.png',
    href: '/docs/api/clickpesa',
    bg: '#ffffff',
  },
  {
    name: 'Selcom',
    logo: '/selcom.webp',
    href: '/docs/api/selcom',
    bg: 'hsla(347.07, 100%, 45.49%, 1)',
  },
];

export default function Page() {
  return (
    <HomeLayout
      githubUrl="https://github.com/borapesa/pesa"
      nav={{
        title: (
          <>
            <img src="/borapesa.svg" alt="Bora Pesa" width={32} height={32} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Bora Pesa</span>
          </>
        ),
      }}
    >
      <style>{`
        .install-block {
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--color-fd-secondary); border-radius: 0.5rem;
          padding: 0.625rem 1rem; font-size: 0.875rem; font-family: monospace;
          margin-bottom: 1rem;
          max-width: calc(100vw - 2rem); overflow-x: auto;
        }
        .install-block code { font-size: inherit; }

        .provider-card {
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          width: 104px; height: 72px;
          border-radius: 0.5rem;
          border: 1px solid var(--color-fd-border); text-decoration: none;
          color: var(--color-fd-foreground);
          transition: border-color 0.15s, transform 0.15s;
        }
        .provider-card:hover { border-color: var(--color-fd-primary); transform: translateY(-1px); }
        .provider-card img { display: block; max-width: 56px; max-height: 48px; object-fit: contain; }

        @media (max-width: 640px) {
          .providers-grid { gap: 1rem; justify-content: flex-start; }
        }
      `}</style>
      <main className="flex flex-col items-center justify-center gap-4 pt-12 px-4 text-center min-h-[80vh]">
        <p className="text-xl text-fd-muted-foreground max-w-2xl mb-4">
          The unified, open-source payments SDK for Tanzania. One API — all providers.
        </p>

        <div className="install-block">
          <code className="break-anywhere">pnpm add @borapesa/pesa</code>
          <CopyButton text="pnpm add @borapesa/pesa" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link href="/docs" className={cn(buttonVariants({ color: 'primary' }), 'px-4 py-2')}>
            Read the docs
          </Link>
          <a
            href="https://github.com/borapesa/pesa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ color: 'outline' }), 'px-4 py-2')}
          >
            GitHub &rarr;
          </a>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 max-w-4xl w-full text-left mb-16">
          {features.map(({ title, desc }) => (
            <div key={title} className="p-6 rounded-lg border border-fd-border">
              <h3 className="font-semibold mb-2 text-lg">{title}</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">Supported Providers</h2>
        <div className="providers-grid flex justify-center gap-8 mb-16 overflow-x-auto py-3">
          {providers.map(({ name, logo, href, bg }) => (
            <Link key={name} href={href} className="provider-card" style={{ background: bg }}>
              <img src={logo} alt={`${name} provider`} />
            </Link>
          ))}
        </div>
      </main>
    </HomeLayout>
  );
}
