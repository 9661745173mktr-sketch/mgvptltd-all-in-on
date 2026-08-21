'use client';

import React from 'react';
import CreateIdPanel from '../../../components/CreateIdPanelFixed';

export default function CreateIdPage() {
  return (
    <main className="min-h-screen bg-[#060b14] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-slate-900 via-[#0b1424] to-[#111827] p-6 shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">MG PVT LTD • Partner Network</div>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Create Partner ID</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            आपके account level के अनुसार ही अगला partner level दिखाई देगा। Payment के लिए fixed-amount UPI QR automatically generate होगा।
          </p>
        </div>
        <CreateIdPanel />
      </div>
    </main>
  );
}
