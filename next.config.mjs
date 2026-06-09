/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hide the X-Powered-By header to reduce information leakage.
  poweredByHeader: false,

  // Standalone output is optimal for Docker/containerized production deployments.
  // It bundles only the necessary node_modules and server files.
  output: 'standalone',

  // Production security headers applied globally.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
