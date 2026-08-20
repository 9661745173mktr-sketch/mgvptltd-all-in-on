'use client';

import { useEffect, useState } from 'react';

export default function InstallAppButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed) return null;

  if (!prompt) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
        📲 Chrome/Android में browser menu से <b className="text-white">Install app</b> चुनें।
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        await prompt.prompt();
        await prompt.userChoice;
        setPrompt(null);
      }}
      className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
    >
      📲 Install MG Portal App
    </button>
  );
}
