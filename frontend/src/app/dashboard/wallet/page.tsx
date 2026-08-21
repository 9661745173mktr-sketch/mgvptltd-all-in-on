'use client';

import { QRCodeSVG } from 'qrcode.react';

export default function WalletPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020617',
        color: '#fff',
        padding: '50px',
        textAlign: 'center',
      }}
    >
      <h1>QR TEST</h1>

      <div
        style={{
          display: 'inline-block',
          background: '#fff',
          padding: '20px',
          borderRadius: '15px',
        }}
      >
        <QRCodeSVG
          value="HELLO WORLD 123456"
          size={300}
        />
      </div>

      <h2 style={{ color: '#22c55e' }}>
        QR TEST
      </h2>
    </div>
  );
}