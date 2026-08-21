import './globals.css';
import type { Metadata } from 'next';
import InstallAppButton from '../components/InstallAppButton';

export const metadata: Metadata = {
  title: 'MG-PVT-LTD | Enterprise Multi-Service Portal',
  description: 'World-class enterprise multi-service SaaS platform',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'MG Portal', statusBarStyle: 'black-translucent' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased">
        {children}
        <div className="fixed bottom-4 right-4 z-[9999] max-w-[280px]">
          <InstallAppButton />
        </div>
      </body>
    </html>
  );
}