import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

export const size = { width: 180, height: 180 };

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #0c4a6e 100%)',
      }}
    >
      <div
        style={{
          width: '70%',
          height: '70%',
          borderRadius: '22%',
          background: 'rgba(15,23,42,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid rgba(56,189,248,0.55)',
        }}
      >
        <span
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: '#7dd3fc',
            fontFamily: 'Georgia, serif',
          }}
        >
          S
        </span>
      </div>
    </div>,
    { ...size }
  );
}
