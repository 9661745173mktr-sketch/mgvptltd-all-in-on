'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#050914] text-white grid place-items-center">
      <div className="text-center">
        <div className="text-2xl font-black text-cyan-300">MG-PVT-LTD</div>
        <div className="mt-2 text-sm text-slate-400">Opening portal…</div>
      </div>
    </main>
  );
}
