# Digital Download Gateway

A production-ready Next.js application for secure digital product delivery integrated with Lemon Squeezy license key validation.

## Architecture

- **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS
- **Backend:** Node.js API routes using native `fetch`
- **Security:** Server-side license validation, HMAC-signed temporary download tokens, CSP headers, HSTS
- **Payments:** Lemon Squeezy checkout + license activation API

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your real values:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` | Yes | Your Lemon Squeezy product checkout URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL of this app (e.g., `https://yourdomain.com`) |
| `DOWNLOAD_SECRET` | Yes | Strong random string for signing download tokens (min 32 chars) |
| `SECURE_DOWNLOAD_URL` | Yes | Final file URL (S3 pre-signed, R2, CDN, or `/product.zip`) |
| `LEMON_SQUEEZY_API_KEY` | No | Only needed for advanced account-level API calls |

### Generating a Secure DOWNLOAD_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Production Deployment Checklist

1. **Set all required environment variables** in your hosting platform.
2. **Enable HTTPS** (required for HSTS and secure cookies).
3. **Configure `SECURE_DOWNLOAD_URL`**:
   - **Local testing:** Place `product.zip` in `/public/product.zip` and set `SECURE_DOWNLOAD_URL=/product.zip`
   - **Production:** Use an S3 pre-signed URL, Cloudflare R2 signed URL, or similar
4. **Verify `.env.local` is in `.gitignore`** (already included).
5. **Build and deploy:**
   ```bash
   npm run build
   ```
   The `output: 'standalone'` setting in `next.config.mjs` produces an optimized bundle for Docker or serverless platforms.

## Security Features

- **No client-side API exposure:** All Lemon Squeezy calls happen server-side in `/api/activate`
- **Signed download tokens:** 15-minute expiry HMAC tokens prevent link sharing
- **Security headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Fail-fast env validation:** Server throws at boot if required secrets are missing

## API Routes

### `POST /api/activate`

Activates a Lemon Squeezy license and returns a temporary download token.

**Body:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "instanceName": "user@example.com"
}
```

**Success:**
```json
{
  "success": true,
  "downloadUrl": "https://yourdomain.com/api/download?token=<signed-token>"
}
```

**Failure:**
```json
{
  "success": false,
  "error": "License key not found or expired."
}
```

### `GET /api/download?token=<token>`

Validates the signed token and redirects to the actual file.

## License

MIT
