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

## Apartment Data

Apartments are updated manually in:

```text
data/apartments.json
```

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

Payments are not active yet. Debit/Credit Card, PayPal, Bank Transfer, Stripe, Paystack and Flutterwave buttons are placeholders marked `Payment integration pending`.

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
