'use client';

import { useState } from 'react';

export default function PurchaseModal({ checkoutUrl }) {
  const [open, setOpen] = useState(false);
  const isPlaceholder = !checkoutUrl || checkoutUrl.includes('your-store') || checkoutUrl.includes('xxxxxx');

  if (!isPlaceholder) {
    return (
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-8 py-3 text-lg font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan"
      >
        <span className="absolute inset-0 rounded-lg bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition" />
        <span className="relative">Initialize Purchase</span>
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-8 py-3 text-lg font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan"
      >
        <span className="absolute inset-0 rounded-lg bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition" />
        <span className="relative">Initialize Purchase</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-8 border border-cyan-500/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Configuration Required
            </div>

            <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 mb-4">
              Checkout Not Configured
            </h2>

            <p className="text-gray-400 text-sm font-mono leading-relaxed mb-6">
              To see the Lemon Squeezy checkout, update your <code className="text-cyan-400 bg-cyan-500/10 px-1 rounded">NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL</code> in <code className="text-cyan-400 bg-cyan-500/10 px-1 rounded">.env.local</code> with your real product checkout link from the Lemon Squeezy dashboard.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg bg-gray-900/60 border border-gray-800 p-4 font-mono text-xs text-gray-500">
                <p className="text-gray-600 mb-1 uppercase tracking-wider">Expected format:</p>
                <p className="text-cyan-400/80">https://your-store.lemonsqueezy.com/buy/abc123</p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-4 py-2.5 text-cyan-300 font-mono font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
