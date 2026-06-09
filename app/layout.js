import './globals.css';

export const metadata = {
  title: 'NEXUS // Secure Download Gateway',
  description: 'Next-generation license validation and digital product delivery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-gray-100 grid-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}
