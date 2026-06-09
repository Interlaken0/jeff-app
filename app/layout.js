import './globals.css';

export const metadata = {
  title: 'JJ Confederation Ltd',
  description: 'Secure digital product delivery and license management.',
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
