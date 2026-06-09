'use client';

export default function PurchaseModal({ checkoutUrl }) {
  const isPlaceholder = !checkoutUrl || checkoutUrl === '#' || checkoutUrl.includes('your-store') || checkoutUrl.includes('xxxxxx');

  // If the checkout URL is a placeholder, link to the Lemon Squeezy homepage
  // as a temporary destination until the real product URL is configured.
  const href = isPlaceholder ? 'https://lemonsqueezy.com' : checkoutUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/40 px-8 py-3 text-lg font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all box-glow-cyan"
    >
      Initialize Purchase
    </a>
  );
}
