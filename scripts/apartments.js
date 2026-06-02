// KAVARO Stays apartment helpers.
// Apartment records are maintained manually in data/apartments.json.
// To add or update listings, edit that JSON file and keep each apartment id unique.

export async function loadApartments() {
  const response = await fetch('/data/apartments.json');
  if (!response.ok) {
    throw new Error('Unable to load KAVARO apartment data.');
  }
  return response.json();
}

export function filterApartments(apartments, filters = {}) {
  return apartments.filter((apartment) => {
    const location = !filters.location || apartment.location.toLowerCase().includes(filters.location.toLowerCase());
    const price = !filters.maxPrice || apartment.pricePerNight <= Number(filters.maxPrice);
    const guests = !filters.guests || apartment.maxGuests >= Number(filters.guests);
    const bedrooms = !filters.bedrooms || apartment.bedrooms >= Number(filters.bedrooms);
    return location && price && guests && bedrooms;
  });
}
