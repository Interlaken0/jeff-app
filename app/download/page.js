'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setDownloadUrl('');

    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          instanceName: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setMessage(data.error || 'Activation failed. Verify credentials and retry.');
        return;
      }

      setStatus('success');
      setDownloadUrl(data.downloadUrl);
    } catch (err) {
      setStatus('error');
      setMessage('Transmission failure. Retry sequence initiated.');
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Terminal header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-mono tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            Vault Access
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300">
            AUTHENTICATE
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-mono">
            Enter credentials to decrypt secure payload.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider mb-2">
                Identity Hash (Email)
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg bg-gray-900/60 border border-gray-700 px-4 py-2.5 text-gray-200 placeholder-gray-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 outline-none transition font-mono text-sm"
                placeholder="user@nexus.net"
              />
            </div>

            <div>
              <label htmlFor="licenseKey" className="block text-xs font-mono font-medium text-fuchsia-400 uppercase tracking-wider mb-2">
                Access Token (License Key)
              </label>
              <input
                id="licenseKey"
                type="text"
                required
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="block w-full rounded-lg bg-gray-900/60 border border-gray-700 px-4 py-2.5 text-gray-200 placeholder-gray-600 focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 outline-none transition font-mono text-sm"
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full relative rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-4 py-2.5 text-cyan-300 font-mono font-semibold text-sm uppercase tracking-wider hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Decrypting...
                </span>
              ) : (
                'Decrypt & Transmit'
              )}
            </button>
          </form>

          {status === 'error' && (
            <div className="mt-5 rounded-lg bg-red-950/40 p-4 text-sm border border-red-500/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-red-400 font-semibold uppercase text-xs tracking-wider">Authentication Failed</span>
              </div>
              <p className="text-red-300/80 font-mono text-xs">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-5 rounded-lg bg-emerald-950/40 p-5 border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-400 font-semibold uppercase text-xs tracking-wider">Handshake Verified</span>
              </div>
              <p className="text-emerald-300/80 font-mono text-xs">
                License validated. Secure download token generated with 15-minute TTL.
              </p>
              <a
                href={downloadUrl}
                className="block w-full text-center rounded-lg bg-emerald-500/10 border border-emerald-500/40 px-4 py-2.5 text-emerald-300 font-mono font-semibold text-sm uppercase tracking-wider hover:bg-emerald-500/20 hover:border-emerald-400 transition-all box-glow-cyan"
              >
                Initiate Download
              </a>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-mono text-gray-600 hover:text-cyan-400 transition uppercase tracking-wider"
            >
              &larr; Return to JJ Confederation Ltd
            </Link>
          </div>
        </div>

        {/* Decorative footer */}
        <div className="mt-6 text-center text-[10px] font-mono text-gray-700 tracking-widest uppercase">
          <span className="text-cyan-600/40">ENCRYPTED</span>
          <span className="mx-2 text-gray-800">//</span>
          <span className="text-fuchsia-600/40">TLS 1.3</span>
        </div>
      </div>
    </main>
  );
}
