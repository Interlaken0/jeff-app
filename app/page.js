import Link from 'next/link';

export default function Home() {
  const checkoutUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || '#';

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-40 lg:pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          System Online
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300">
          JJ Confederation Ltd
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Next-generation license validation and secure digital product delivery.
          Server-side encrypted. Zero exposure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-8 py-3 text-lg font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan"
          >
            <span className="absolute inset-0 rounded-lg bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition" />
            <span className="relative">Initialize Purchase</span>
          </a>

          <Link
            href="/download"
            className="group relative inline-flex items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/40 px-8 py-3 text-lg font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20 hover:border-fuchsia-400 transition-all box-glow-fuchsia"
          >
            <span className="absolute inset-0 rounded-lg bg-fuchsia-400/10 opacity-0 group-hover:opacity-100 transition" />
            <span className="relative">Access Vault</span>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass rounded-xl p-8 hover:border-cyan-500/30 transition group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 group-hover:box-glow-cyan transition">
              <span className="text-cyan-300 font-mono text-sm">01</span>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 tracking-tight">Secure Validation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              All license checks execute server-side via encrypted channels. Client never touches the API.
            </p>
          </div>

          <div className="glass rounded-xl p-8 hover:border-fuchsia-500/30 transition group">
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mb-5 group-hover:box-glow-fuchsia transition">
              <span className="text-fuchsia-300 font-mono text-sm">02</span>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 tracking-tight">Instant Delivery</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              HMAC-signed tokens with 15-minute expiry. One-time secure links generated on activation.
            </p>
          </div>

          <div className="glass rounded-xl p-8 hover:border-violet-500/30 transition group">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-5 group-hover:box-glow-cyan transition">
              <span className="text-violet-300 font-mono text-sm">03</span>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 tracking-tight">Lemon Squeezy</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Native integration with Lemon Squeezy license engine. Payments, keys, and downloads unified.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 text-gray-600 text-xs font-mono tracking-wider uppercase">
        <p>JJ Confederation Ltd // Encrypted Transmission</p>
      </footer>
    </main>
  );
}
