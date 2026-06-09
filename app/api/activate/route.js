import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Production Configuration & Validation
// ---------------------------------------------------------------------------
// Fail fast at boot time if required environment variables are missing.
// This prevents silent runtime failures in production.
// ---------------------------------------------------------------------------
const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

if (!DOWNLOAD_SECRET) {
  throw new Error(
    'FATAL: DOWNLOAD_SECRET is not defined. Set a strong random string in .env.local'
  );
}
if (!APP_URL) {
  throw new Error(
    'FATAL: NEXT_PUBLIC_APP_URL is not defined. Set your public base URL in .env.local'
  );
}

// ---------------------------------------------------------------------------
// Helper: createSecureToken
// Generates a time-bound, HMAC-signed token using Node's native crypto module.
// Payload: { licenseKey, exp }
// Format: base64url( JSON.stringify(payload) + "." + hmacSignature )
// ---------------------------------------------------------------------------
function createSecureToken(licenseKey) {
  const payload = JSON.stringify({ licenseKey, exp: Date.now() + TOKEN_TTL_MS });
  const signature = crypto
    .createHmac('sha256', DOWNLOAD_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

// ---------------------------------------------------------------------------
// POST /api/activate
// ---------------------------------------------------------------------------
// This route acts as a secure proxy between the client and Lemon Squeezy.
// It receives the user's license key and instance name (here, their email),
// forwards them to Lemon Squeezy's public license activation endpoint using
// native fetch with URLSearchParams, and handles the response.
//
// On success: returns { success: true, downloadUrl }.
// On failure: returns { success: false, error } with a 403 status.
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    // 1. Parse incoming JSON body from the client form.
    const { licenseKey, instanceName } = await request.json();

    // 2. Guard clause: both fields are required.
    if (!licenseKey || !instanceName) {
      return NextResponse.json(
        { success: false, error: 'License key and instance name are required.' },
        { status: 400 }
      );
    }

    // 3. Build the application/x-www-form-urlencoded body.
    const body = new URLSearchParams();
    body.append('license_key', licenseKey);
    body.append('instance_name', instanceName);

    // 4. Perform the server-to-server request to Lemon Squeezy.
    //    No API key is required for the public /licenses/activate endpoint.
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    // 5. Parse Lemon Squeezy's JSON response.
    const data = await response.json();

    // 6. Map Lemon Squeezy's status to our internal format.
    //    A failed activation usually includes an `error` field or `activated: false`.
    if (data.error || data.activated !== true) {
      return NextResponse.json(
        { success: false, error: data.error || 'License activation failed.' },
        { status: 403 }
      );
    }

    // 7. Activation succeeded. Generate a temporary secure download token
    //    and construct the public download gateway URL.
    const token = createSecureToken(licenseKey);
    const downloadUrl = `${APP_URL}/api/download?token=${token}`;

    return NextResponse.json({ success: true, downloadUrl });
  } catch (err) {
    // 8. Catch unexpected runtime errors (e.g., network failures).
    console.error('Activation error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
