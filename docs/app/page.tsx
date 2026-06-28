import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { Metadata } from 'next';
import Link from 'next/link';
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
    size: 48,
  },
  {
    name: 'ClickPesa',
    logo: '/clickpesa.png',
    href: '/docs/api/clickpesa',
    bg: '#ffffff',
    size: 64,
    px: '1.5rem 1.75rem',
  },
  {
    name: 'Selcom',
    logo: '/selcom.webp',
    href: '/docs/api/selcom',
    bg: 'hsla(347.07, 100%, 45.49%, 1)',
    size: 48,
  },
];

export default function Page() {
  return (
    <HomeLayout>
      <style>{`
        .btn-primary {
          display: inline-flex; align-items: center; padding: 0.75rem 1.5rem;
          border-radius: 0.5rem; border: none; font-weight: 500; font-size: 1rem;
          text-decoration: none; cursor: pointer;
          background: var(--color-fd-primary); color: var(--color-fd-primary-foreground);
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:active { opacity: 0.8; transform: translateY(0); }

        .btn-outline {
          display: inline-flex; align-items: center; padding: 0.75rem 1.5rem;
          border-radius: 0.5rem; border: 1px solid var(--color-fd-border); font-size: 1rem;
          font-weight: 500; text-decoration: none; cursor: pointer;
          color: var(--color-fd-foreground); background: transparent;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .btn-outline:hover { background: var(--color-fd-accent); border-color: var(--color-fd-primary); transform: translateY(-1px); }
        .btn-outline:active { transform: translateY(0); }

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
          padding: 1.5rem 2rem; border-radius: 0.5rem;
          border: 1px solid var(--color-fd-border); text-decoration: none;
          color: var(--color-fd-foreground);
          transition: border-color 0.15s, transform 0.15s;
        }
        .provider-card:hover { border-color: var(--color-fd-primary); transform: translateY(-1px); }
        .provider-card img { display: block; }

        @media (max-width: 640px) {
          .providers-grid { gap: 1rem; justify-content: flex-start; }
          .provider-card { padding: 1rem 1.25rem; }
        }
      `}</style>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          padding: '0 1rem',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '0.5rem',
          }}
        >
          <img src="/borapesa.svg" alt="Bora Pesa" width={64} height={64} />
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Bora Pesa
          </h1>
        </div>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--color-fd-muted-foreground)',
            maxWidth: '40rem',
            marginBottom: '1rem',
          }}
        >
          The unified, open-source payments SDK for Tanzania. One API — all providers.
        </p>

        <div className="install-block">
          <code style={{ overflowWrap: 'anywhere' }}>pnpm add @borapesa/pesa</code>
          <CopyButton text="pnpm add @borapesa/pesa" />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          <Link href="/docs" className="btn-primary">
            Read the docs
          </Link>
          <a
            href="https://github.com/borapesa/pesa"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            GitHub &rarr;
          </a>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            maxWidth: '56rem',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'left',
            marginBottom: '4rem',
          }}
        >
          {features.map(({ title, desc }) => (
            <div
              key={title}
              style={{
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-fd-border)',
              }}
            >
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                {title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-fd-muted-foreground)',
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          Supported Providers
        </h2>
        <div
          className="providers-grid"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '4rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '0.75rem 0',
          }}
        >
          {providers.map(({ name, logo, href, bg, size, px }) => (
            <Link
              key={name}
              href={href}
              className="provider-card"
              style={{ background: bg, padding: px }}
            >
              <img src={logo} alt={`${name} provider`} width={size} height={size} />
            </Link>
          ))}
        </div>
      </main>
    </HomeLayout>
  );
}
