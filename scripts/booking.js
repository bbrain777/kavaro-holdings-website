// KAVARO Stays booking helpers.
// Real payment integrations are not active. Add Stripe, PayPal, Paystack or Flutterwave keys only after secure backend handling exists.

export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

export function calculateTotal(apartment, checkIn, checkOut) {
  const nights = calculateNights(checkIn, checkOut);
  return {
    nights,
    total: nights * apartment.pricePerNight + apartment.cleaningFee + apartment.securityDeposit,
  };
}

export function saveBookingSummary(summary) {
  localStorage.setItem('kavaroBookingSummary', JSON.stringify(summary));
}

export function readBookingSummary() {
  const saved = localStorage.getItem('kavaroBookingSummary');
  return saved ? JSON.parse(saved) : null;
}
