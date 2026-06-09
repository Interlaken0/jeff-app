'use client';

import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Global Error Boundary
// ---------------------------------------------------------------------------
// Catches runtime errors in the render tree and displays a system failure
// interface consistent with the futuristic Nexus Gateway aesthetic.
// ---------------------------------------------------------------------------
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to your error tracking service (Sentry, LogRocket, etc.)
    console.error('Critical system failure:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 grid-bg">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center border border-red-500/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            System Failure
          </div>

          <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300 mb-4">
            CRITICAL ERROR
          </h2>

          <p className="text-gray-400 text-sm mb-8 font-mono leading-relaxed">
            An unexpected system fault has occurred. Reinitialize the process or contact JJ Confederation Ltd support.
          </p>

          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-6 py-2.5 text-cyan-300 font-mono font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan"
          >
            Reboot System
          </button>
        </div>
      </body>
    </html>
  );
}
