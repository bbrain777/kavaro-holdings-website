# KAVARO Holdings Ltd Website

Premium multi-page React/Vite website for KAVARO Holdings Ltd, including business divisions, KAVARO Stays apartment listings, booking preparation, payment placeholders, CSR and Zion Youth Development Initiative integration.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The main pages include:

- `index.html`
- `about.html`
- `businesses.html`
- `properties.html`
- `technologies.html`
- `trading.html`
- `ventures.html`
- `stays.html`
- `apartment-details.html`
- `booking.html`
- `payment.html`
- `investments.html`
- `csr.html`
- `references.html`
- `contact.html`

## Production Build

```bash
npm run build
npm run preview
```

## Vercel Deployment

This project is a Vite React website.

### Vercel Project Settings

- GitHub repository: `bbrain777/kavaro-holdings-website`
- Vercel project name: `kavaro-holdings-website`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### Import To Vercel

1. Go to https://vercel.com/new.
2. Choose the GitHub repository `bbrain777/kavaro-holdings-website`.
3. Set the project name to `kavaro-holdings-website`.
4. Keep the Vite defaults:
- Build command: `npm run build`
- Output directory: `dist`
5. Deploy the project.

### Stripe Card Payments

The Debit/Credit Card button uses Stripe Checkout through the Vercel function:

```text
api/create-checkout-session.js
```

Add these environment variables in Vercel under Project Settings > Environment Variables:

| Name | Example value | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Use `sk_test_...` while testing, then replace with the live key when ready. |
| `SITE_URL` | `https://kavaroholdings.com` | Used for Stripe success/cancel redirect URLs. |

After adding or changing environment variables, redeploy the Vercel project.

### Admin Access For Apartment Editing

The apartment manager on `stays.html` is protected by Vercel serverless authentication. Add these environment variables in Vercel under Project Settings > Environment Variables:

| Name | Example value | Notes |
| --- | --- | --- |
| `ADMIN_EMAIL` | `olakunleobademi@gmail.com` | Only this email can sign in unless you change the value. |
| `ADMIN_PASSWORD` | `password` | Use a stronger password before going live. Do not commit real passwords to GitHub. |
| `ADMIN_SESSION_SECRET` | long random secret | Used to sign the admin session cookie. |

After adding or changing admin environment variables, redeploy the Vercel project.

For local admin testing, run the project with Vercel Dev instead of plain Vite so `/api/admin-login`, `/api/admin-session` and `/api/admin-logout` are available:

```bash
vercel dev
```

Plain `npm run dev` starts the Vite front end only, so the admin API routes will not respond on `localhost:5173`.

For local testing, create `.env.local` with your admin values. This file is ignored by Git and must not be committed:

```text
ADMIN_EMAIL=olakunleobademi@gmail.com
ADMIN_PASSWORD=password
ADMIN_SESSION_SECRET=replace-with-a-local-secret
SITE_URL=http://127.0.0.1:3000
```

### Persistent Apartment Listings With Vercel Storage

The front-end apartment manager now supports persistent listings through Vercel serverless APIs.

Use:

- Vercel Postgres/Neon integration for apartment listing data.
- Vercel Blob for apartment photo uploads.

In Vercel, add the database and blob storage integrations to the `kavaro-holdings-website` project. Vercel should provide environment variables similar to:

```text
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
BLOB_READ_WRITE_TOKEN=...
```

The site uses these API routes:

```text
api/apartments.js
api/admin-apartments.js
api/admin-upload.js
```

If database variables are missing, the admin editor falls back to browser `localStorage`. In fallback mode, listings appear only in the current browser and may disappear if browser storage is cleared. Once Vercel Postgres is configured, admin-created listings are saved in the database and appear for all visitors.

If `BLOB_READ_WRITE_TOKEN` is missing, uploaded photos fall back to browser-only data URLs. For production, configure Vercel Blob so photos are stored as permanent public URLs.

Stripe checkout also reads database-created apartments, so custom listings can be priced server-side after the database is configured.

### Production Domains

Add these domains in the Vercel project under Settings > Domains:

- `kavaroholdings.com`
- `www.kavaroholdings.com`

### Namecheap DNS Records

Use Namecheap only for domain/DNS management. Do not buy Namecheap hosting.

Remove any conflicting old A, CNAME, parking, forwarding, or URL redirect records for `@` and `www`, then add:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | `@` | `76.76.21.21` | Automatic |
| CNAME Record | `www` | `cname.vercel-dns.com` | Automatic |

After DNS propagation, verify:

- `https://kavaroholdings.com`
- `https://www.kavaroholdings.com`
- SSL certificate is active in Vercel.
- Navigation links work.
- Mobile layout works.
- Contact form displays and validates.
- Booking and payment placeholder pages work.

## Apartment Data

Apartments are updated manually in:

```text
data/apartments.json
```

The Stays page also includes a front-end apartment manager for creating and editing listings from the browser. It supports photo upload previews and saves custom listings to browser `localStorage`, so those custom listings appear immediately on the Stays, Details and Booking pages in the same browser.

For a production admin where updates appear to every visitor, connect this flow to a database and file storage service. The committed `data/apartments.json` remains the trusted source for deployed default apartments and Stripe server-side price validation.

### Add A New Apartment

1. Copy an existing apartment object.
2. Paste it as a new item in the JSON array.
3. Change the `id` to a unique lowercase value, for example `kavaro-leeds-city-stay`.
4. Update all text, prices, availability, amenities, rules and images.
5. Keep valid JSON formatting: double quotes, commas between objects, no trailing comma after the final object.

### Change Prices

Edit:

- `pricePerNight`
- `pricePerWeek`
- `pricePerMonth`
- `cleaningFee`
- `securityDeposit`

### Add Images

Edit the `images` array. Use full image URLs or future local asset paths. The first image is used as the main listing photo.

### Update Availability

Edit:

- `availabilityStatus`
- `availableDates`

Use clear statuses such as `Available`, `Limited Availability`, `Reserved`, or `Unavailable`.

### Remove Unavailable Properties

Either set `availabilityStatus` to `Unavailable` or remove the full apartment object from `data/apartments.json`.

## Booking And Payments

The booking form validates required fields, prevents checkout dates before check-in dates, calculates nights, calculates the total cost, saves the booking summary to `localStorage`, and sends the guest to `payment.html`.

The payment page shows a single Debit/Credit Card option. When Stripe is configured in Vercel, guests continue to Stripe Checkout to enter card details securely. KAVARO does not store card numbers.

## Future Upgrade Plan

- Admin dashboard
- Real booking calendar
- Online payment integration
- Email confirmation
- WhatsApp confirmation
- Invoice/receipt generation
- Property owner dashboard

## Technology Profile Links

The Technologies page currently uses `#` for portfolio, GitHub and LinkedIn links. Replace those with Tayo Obademi's real portfolio, GitHub and LinkedIn URLs when available.

## Public Name Rule

Public website references use:

```text
Tayo Obademi
Founder & President, KAVARO Holdings Ltd
```

Do not use the longer legal/private name publicly unless a future legal page requires it.
