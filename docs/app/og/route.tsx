import { ImageResponse } from '@vercel/og';

export const dynamic = 'force-static';

const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D7A3E 0%, #0A5C2F 50%, #0D7A3E 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#FFFFFF',
        padding: 80,
      }}
    >
      {/* Coin icon */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: '#0D7A3E',
          border: '4px solid #F5A623',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          boxShadow: '0 0 0 8px rgba(245, 166, 35, 0.15), 0 0 0 16px rgba(255, 255, 255, 0.05)',
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        >
          BP
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '0 0 12px 0',
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        Bora Pesa
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: 32,
          color: 'rgba(255, 255, 255, 0.75)',
          margin: 0,
          textAlign: 'center',
          maxWidth: 720,
          lineHeight: 1.3,
        }}
      >
        The unified, open-source payments SDK for Tanzania
      </p>

      {/* Bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: '#F5A623',
        }}
      />
    </div>,
    size,
  );
}
