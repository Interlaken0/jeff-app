# JJ Confederation Ltd — The Full Game Plan

*A conversational walkthrough of how this whole thing works, why it's built this way, and what every piece does. No jargon. No fluff.*

---

## The Big Picture

Imagine you made a digital product. A software tool, a template, an ebook — whatever. You want to sell it online. But here's the problem: once someone buys it, how do you stop them from sharing the download link with the entire internet?

**That's what this app solves.**

JJ Confederation Ltd is a secure download gateway. Think of it like a nightclub bouncer for your digital files. Customers pay at the door (Lemon Squeezy), get a wristband (license key), show it to the bouncer (our backend), and only then get into the VIP room (the download).

---

## Part 1: The Storefront (What Users See)

### The Landing Page (`/`)

This is your shop window. Dark, futuristic, a little cyberpunk. Two buttons:

1. **"Initialize Purchase"** — Links to your Lemon Squeezy checkout. If you haven't set up your real checkout URL yet, it shows a friendly modal instead of a broken 404 page.
2. **"Access Vault"** — Takes existing customers to the license validation form.

```
User lands on page
  ├── Wants to buy? → Clicks "Initialize Purchase"
  │     └── Goes to Lemon Squeezy checkout
  │           └── Pays
  │                 └── Gets license key via email
  │
  └── Already bought? → Clicks "Access Vault"
        └── Goes to /download
```

### The Download Gate (`/download`)

This is where the magic happens. A sleek form asking for:
- **Identity Hash (Email)** — Just their email, relabeled to fit the theme.
- **Access Token (License Key)** — The key they got from Lemon Squeezy after purchase.

When they hit **"Decrypt & Transmit"**, the frontend sends a POST request to `/api/activate` with those two fields. Then it waits.

Three possible outcomes:
1. **Loading** — Spinning animation. "Decrypting..."
2. **Success** — Green glow. "Handshake Verified." Shows a download button.
3. **Error** — Red glow. "Authentication Failed." Shows exactly what went wrong.

---

## Part 2: The License Key Lifecycle

### Where Do Keys Come From?

**You don't make them. Lemon Squeezy does.**

Here's the timeline:

```
Step 1: You create a product in Lemon Squeezy
        └── Turn ON "Generate license keys" in product settings
        └── Choose format (e.g., XXXX-XXXX-XXXX-XXXX)

Step 2: Customer clicks your checkout link
        └── Lands on Lemon Squeezy hosted checkout
        └── Enters payment details
        └── Clicks "Buy"

Step 3: Lemon Squeezy does three things instantly:
        ├── Charges the customer (or simulates in test mode)
        ├── Generates a unique license key (e.g., ABCD-EFGH-IJKL-MNOP)
        └── Emails the key to the customer

Step 4: Customer copies the key from their email
        └── Opens your /download page
        └── Pastes the key into the form
        └── Clicks submit
```

That's it. The key is created automatically at the moment of purchase. You never touch it.

### What Does a Key Actually Do?

A license key is a secret string that proves "this person paid." Think of it like a concert ticket:

- **Unique:** Every customer gets a different key.
- **Trackable:** Lemon Squeezy knows which order it belongs to.
- **Activatable:** When used, it creates an "instance" (a record of this specific activation on this device/account).
- **Revocable:** If someone refunds or abuses it, you can disable the key from your dashboard.

---

## Part 3: The Backend Validation Flow

This is the heart of the security model. Every step is server-side. The browser is treated as untrusted.

### The Activation API (`POST /api/activate`)

When the form is submitted, here's exactly what happens behind the scenes:

```
RECEIVE request from browser:
  body = {
    licenseKey: "ABCD-EFGH-IJKL-MNOP",
    instanceName: "greg@jjconfederation.com"
  }

STEP 1: Sanity check
  IF licenseKey is empty OR instanceName is empty:
    RETURN 400 Bad Request
    "License key and instance name are required."

STEP 2: Build the request body for Lemon Squeezy
  body = URLSearchParams:
    license_key = "ABCD-EFGH-IJKL-MNOP"
    instance_name = "greg@jjconfederation.com"

  // Why URLSearchParams and not JSON?
  // Because Lemon Squeezy's activate endpoint expects
  // application/x-www-form-urlencoded, not JSON.

STEP 3: Secret server-to-server call
  POST https://api.lemonsqueezy.com/v1/licenses/activate
  Headers:
    Accept: application/json
    Content-Type: application/x-www-form-urlencoded
  Body: license_key=...&instance_name=...

  // Notice: NO API key needed here.
  // The /licenses/activate endpoint is public.
  // It only validates keys, it doesn't expose orders or revenue.

STEP 4: Interpret Lemon Squeezy's response

  IF response contains "error" OR activated != true:
    // Could be:
    //   - "License key not found"
    //   - "License key has expired"
    //   - "License key has reached its activation limit"
    RETURN 403 Forbidden
    { success: false, error: "exact message from Lemon Squeezy" }

  ELSE (activation succeeded):
    // The key is valid and now has an active instance
    // attached to this email/device combo.

    // Create a temporary secure download token.
    // This token is NOT the license key.
    // It's a completely separate, time-limited secret.

    token = createSecureToken(licenseKey)
      // token = base64url( JSON.stringify({ licenseKey, exp }) + "." + HMAC )
      // HMAC = SHA256( payload, DOWNLOAD_SECRET )
      // exp = now + 15 minutes

    downloadUrl = APP_URL + "/api/download?token=" + token

    RETURN 200 OK
    {
      success: true,
      downloadUrl: "http://localhost:3000/api/download?token=abc123..."
    }
```

### The Download Token (`GET /api/download?token=...`)

The user clicks the download link. Now what?

```
RECEIVE request from browser:
  query = { token: "abc123..." }

STEP 1: Token present?
  IF no token:
    RETURN 400 "Missing download token."

STEP 2: Decode the token
  decoded = base64url_decode(token)
  [payload, signature] = split(decoded, ".")

  IF payload missing OR signature missing:
    RETURN 400 "Invalid token format."

STEP 3: Verify the signature
  expectedSignature = HMAC_SHA256(payload, DOWNLOAD_SECRET)

  IF signature != expectedSignature:
    // Someone tampered with the token.
    // Or forged it entirely.
    RETURN 403 "Invalid download token."

STEP 4: Check expiration
  { exp, licenseKey } = JSON.parse(payload)

  IF Date.now() > exp:
    // Token expired. User needs to re-activate.
    RETURN 403 "Download link has expired."

STEP 5: Check file destination configured?
  IF SECURE_DOWNLOAD_URL not set:
    RETURN 500 "Download URL not configured."

STEP 6: Redirect to the real file
  RETURN 302 Redirect to SECURE_DOWNLOAD_URL

  // The user is now at the actual file URL.
  // This could be:
  //   - An S3 pre-signed URL (expires in hours)
  //   - A Cloudflare R2 signed URL
  //   - A static file on your own server
```

---

## Part 4: The Security Architecture

This section is why we didn't just use a simple "paste your key, get a direct link" approach.

### Threat Model: What Are We Defending Against?

| Threat | How We Stop It |
|--------|----------------|
| **User shares their license key** | Each key has an activation limit (set in Lemon Squeezy). If they share it, it hits the limit and stops working for new devices. |
| **User shares the download link** | The `/api/download` token is HMAC-signed and expires in 15 minutes. Even if they share the link, it dies quickly. |
| **Someone forges a download token** | Impossible without `DOWNLOAD_SECRET`. The token is cryptographically signed. We recompute the signature server-side and reject anything that doesn't match. |
| **Someone bypasses the frontend and calls the API directly** | We don't care. The API does the exact same validation regardless of who calls it. No secrets are leaked. |
| **Someone inspects the network tab and finds the real file URL** | They see `SECURE_DOWNLOAD_URL` only after passing the token gate. If you use an S3 pre-signed URL, that URL also expires independently. Double lock. |
| **Lemon Squeezy goes down** | The `/api/activate` route handles network errors gracefully and returns a 500 with a generic message. No crashes. |

### Why Server-Side Only?

The most common mistake in license validation apps is calling the Lemon Squeezy API from the browser. Don't do that. Here's why:

**If the browser calls Lemon Squeezy directly:**
```
// BAD — don't do this
fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
  body: JSON.stringify({ license_key: key })
})
```
Problem: Anyone can open DevTools, copy your API call, and build a tool that activates keys for free. Or they can intercept the response and always fake "success."

**Our approach (server-side proxy):**
```
Browser → POST /api/activate (your server)
              ↓
         Your server → POST lemonsqueezy.com (secret)
              ↓
         Your server decides what to tell the browser
```
The browser never sees Lemon Squeezy. It only sees your API. Your API is the gatekeeper.

### The Token Chain

There are actually **two** separate secrets in this system:

1. **The License Key** (from Lemon Squeezy)
   - Proves the user paid
   - Lives in the user's email / order history
   - Managed by Lemon Squeezy

2. **The Download Token** (from your server)
   - Proves the user activated successfully in the last 15 minutes
   - Lives only in the browser's memory for a short time
   - Signed by your `DOWNLOAD_SECRET`

These are completely separate. Knowing one tells you nothing about the other.

---

## Part 5: The Production Environment

### Required Secrets (`.env.local`)

| Variable | What It Does | Where You Get It |
|----------|-------------|------------------|
| `NEXT_PUBLIC_APP_URL` | Your public domain. Used to build download URLs. | You set this. `http://localhost:3000` for dev, `https://jjconfederation.com` for prod. |
| `DOWNLOAD_SECRET` | Signs temporary download tokens. | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. **Never share this.** |
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` | Your product checkout page. | Lemon Squeezy dashboard → Product → Checkout Link. |
| `SECURE_DOWNLOAD_URL` | The actual file customers download. | Upload to S3/R2 and get a pre-signed URL. Or put in `/public/product.zip` for testing. |
| `LEMON_SQUEEZY_API_KEY` | For advanced API calls (orders, customers). | Lemon Squeezy dashboard → Settings → API. **Optional.** |

### Security Headers (Already Configured)

These are injected on every response to harden the app:

- **X-Frame-Options: DENY** — Prevents your site from being embedded in malicious iframes.
- **X-Content-Type-Options: nosniff** — Stops browsers from guessing file types.
- **Content-Security-Policy** — Restricts where scripts, images, and connections can come from.
- **Strict-Transport-Security** — Forces HTTPS in production.
- **Referrer-Policy** — Limits what info leaks when users click external links.

### Fail-Fast Validation

When the server starts, it immediately checks:
```
IF DOWNLOAD_SECRET is missing:
  THROW "FATAL: DOWNLOAD_SECRET is not defined"

IF NEXT_PUBLIC_APP_URL is missing:
  THROW "FATAL: NEXT_PUBLIC_APP_URL is not defined"
```
This means if you forget to set environment variables, the server crashes at boot with a clear error. It never silently fails mid-request.

---

## Part 6: Deployment Checklist

Before going live, run through this:

1. **Environment variables set?**
   - [ ] `NEXT_PUBLIC_APP_URL` = real domain
   - [ ] `DOWNLOAD_SECRET` = strong random string
   - [ ] `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` = real checkout link
   - [ ] `SECURE_DOWNLOAD_URL` = real file location

2. **Lemon Squeezy store ready?**
   - [ ] Identity verified
   - [ ] Product created
   - [ ] License key generation enabled
   - [ ] Test purchase made successfully

3. **Security checks?**
   - [ ] `.env.local` is in `.gitignore` (yes, already done)
   - [ ] `DOWNLOAD_SECRET` was generated with `crypto.randomBytes`
   - [ ] `SECURE_DOWNLOAD_URL` is not a static file in `/public/` (use S3/R2 for real prod)

4. **Build & deploy:**
   ```bash
   npm install
   npm run build
   ```
   The `output: 'standalone'` config produces a self-contained bundle in `.next/standalone/` ready for Docker or Vercel.

---

## Part 7: Common Questions

**Q: Can someone reuse a download link?**
A: Only for 15 minutes. After that, the token expires and the `/api/download` route returns 403.

**Q: What if someone shares their license key?**
A: Lemon Squeezy tracks activations per key. You set a limit (e.g., 2 activations). Once exceeded, the key is rejected.

**Q: Can I see who activated what?**
A: Yes, in your Lemon Squeezy dashboard under Orders or via their API using `LEMON_SQUEEZY_API_KEY`.

**Q: What if I want to change the download file later?**
A: Just update `SECURE_DOWNLOAD_URL` in your environment. Old tokens still work (they're just redirects), but new activations will point to the new file.

**Q: Does this work with subscription products?**
A: Lemon Squeezy license keys work for one-time purchases. For subscriptions, you'd use their subscription API to check `status: active` instead of license activation.

**Q: Can I test without paying real money?**
A: Yes — Lemon Squeezy has a Test Mode toggle. Make test purchases with fake card numbers (e.g., `4242 4242 4242 4242`). Test keys activate the same way as real ones.

---

## Summary

JJ Confederation Ltd is a fortress with three layers:

1. **Payment Gate** — Lemon Squeezy handles money and generates keys.
2. **Validation Gate** — Your server verifies keys with Lemon Squeezy, never trusting the client.
3. **Download Gate** — Temporary signed tokens prove activation happened recently, and only then expose the real file.

Every layer is independent. Every layer fails safely. And nothing sensitive ever touches the browser.

*That's the strategy. That's the architecture. Now go sell something.*
