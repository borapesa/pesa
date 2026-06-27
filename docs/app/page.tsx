import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';

export default function Page() {
  return (
    <HomeLayout>
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
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}
        >
          Bora Pesa
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--fd-muted-foreground)',
            maxWidth: '40rem',
            marginBottom: '1rem',
          }}
        >
          The unified, open-source payments SDK for Tanzania. One API — all providers.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          <Link
            href="/docs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              background: 'var(--fd-primary)',
              color: 'var(--fd-primary-foreground)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Read the docs
          </Link>

          <a
            href="https://github.com/borapesa/pesa"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--fd-border)',
              fontWeight: 500,
              textDecoration: 'none',
              color: 'inherit',
            }}
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
            textAlign: 'left',
            marginBottom: '4rem',
          }}
        >
          {[
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
          ].map(({ title, desc }) => (
            <div
              key={title}
              style={{
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--fd-border)',
              }}
            >
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                {title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--fd-muted-foreground)',
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        <code
          style={{
            background: 'var(--fd-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
          }}
        >
          pnpm add @borapesa/pesa @borapesa/clickpesa
        </code>
      </main>
    </HomeLayout>
  );
}
