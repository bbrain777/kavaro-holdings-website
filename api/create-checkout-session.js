import Stripe from 'stripe';
import { getAllApartments } from './_apartments-db.js';

function getOrigin(req) {
  return process.env.SITE_URL || req.headers.origin || `https://${req.headers.host}`;
}

function poundsToPence(value) {
  return Math.max(0, Math.round(Number(value || 0) * 100));
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

async function parseRequestBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured yet.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const summary = await parseRequestBody(req);
    const requestedApartment = summary?.apartment;
    const guest = summary?.guest;
    const apartments = await getAllApartments();
    const apartment = apartments.find((item) => item.id === requestedApartment?.id);
    const nights = nightsBetween(guest?.checkIn, guest?.checkOut);
    const totalAmount = nights * Number(apartment?.pricePerNight || 0) + Number(apartment?.cleaningFee || 0) + Number(apartment?.securityDeposit || 0);
    const total = poundsToPence(totalAmount);

    if (!apartment || !guest || nights <= 0 || total <= 0) {
      return res.status(400).json({ error: 'Missing booking details.' });
    }

    const origin = getOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: guest.email || undefined,
      billing_address_collection: 'auto',
      line_items: [
        {
          quantity: 1,
          price_data: {
              currency: 'gbp',
              unit_amount: total,
              product_data: {
                name: `KAVARO booking - ${apartment.apartmentName}`,
                description: `${nights} night(s), cleaning fee and security deposit included.`,
              },
            },
          },
      ],
      metadata: {
        apartmentId: apartment.id || '',
        apartmentName: apartment.apartmentName || '',
        guestName: guest.fullName || '',
        guestPhone: guest.phone || '',
        checkIn: guest.checkIn || '',
        checkOut: guest.checkOut || '',
        nights: String(nights),
      },
      success_url: `${origin}/payment.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment.html?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to create Stripe checkout session.' });
  }
}
