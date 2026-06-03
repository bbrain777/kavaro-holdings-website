import { useEffect, useMemo, useRef, useState } from 'react';
import apartments from '../data/apartments.json';
import logo from '../logo_kavaro holdings .png';
import founderPhoto from '../Tayo 2.jpeg';

const navItems = [
  { label: 'Home', href: 'index.html' },
  { label: 'About Us', href: 'about.html' },
  {
    label: 'Our Businesses',
    href: 'businesses.html',
    children: [
      { label: 'Properties', href: 'properties.html' },
      { label: 'Technologies', href: 'technologies.html' },
      { label: 'Trading', href: 'trading.html' },
      { label: 'Ventures', href: 'ventures.html' },
    ],
  },
  { label: 'Book Short Stay', href: 'stays.html' },
  {
    label: 'Investments',
    href: 'investments.html',
    children: [
      { label: 'Insights', href: 'references.html' },
    ],
  },
  { label: 'CSR', href: 'csr.html' },
];

const businessCards = [
  {
    title: 'KAVARO Properties',
    href: 'properties.html',
    label: 'Property',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=900&q=80',
    description: 'Property investment, buy-to-let, serviced accommodation, short-stay apartments and future real estate projects.',
  },
  {
    title: 'KAVARO Technologies',
    href: 'technologies.html',
    label: 'Technology',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    description: 'IT consultancy, web development, software development, AI automation and future technology products.',
  },
  {
    title: 'KAVARO Trading',
    href: 'trading.html',
    label: 'Trading',
    image: 'https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80',
    description: 'Import/export, wholesale distribution, supply chain partnerships and global trade opportunities.',
  },
  {
    title: 'KAVARO Ventures',
    href: 'ventures.html',
    label: 'Ventures',
    image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
    description: 'Strategic partnerships, acquisitions, startup support and investment opportunities.',
  },
];

const stats = [
  { label: 'Business Pillars', value: 4, suffix: '' },
  { label: 'Investment Focus Areas', value: 7, suffix: '' },
  { label: 'Strategic Growth Phases', value: 5, suffix: '' },
  { label: 'Global Ambition', value: 100, suffix: '%' },
];

const focusAreas = ['Real Estate', 'Technology', 'Logistics', 'Infrastructure', 'Education', 'Healthcare', 'Financial Technology'];
const values = ['Integrity', 'Excellence', 'Innovation', 'Accountability', 'Partnership', 'Sustainability'];
const bookingNotices = [
  'Prices are subject to confirmation.',
  'Booking is not final until payment is confirmed.',
  'Valid identification may be required before check-in.',
  'Guests must follow apartment rules.',
  'Cancellation policy applies.',
  'KAVARO Holdings Ltd reserves the right to approve, decline, or cancel bookings where necessary.',
];

const apartmentStorageKey = 'kavaroCustomApartments';

const emptyApartmentForm = {
  id: '',
  apartmentName: '',
  location: '',
  addressArea: '',
  shortDescription: '',
  fullDescription: '',
  pricePerNight: '',
  pricePerWeek: '',
  pricePerMonth: '',
  cleaningFee: '',
  securityDeposit: '',
  maxGuests: '1',
  bedrooms: '1',
  bathrooms: '1',
  propertyType: 'Short stay apartment',
  availabilityStatus: 'Available',
  availableDates: '',
  amenities: '',
  houseRules: '',
  cancellationPolicy: 'Cancellation terms apply and are subject to confirmation before booking approval.',
  images: [],
  imageUrl: '',
};

function slugify(value) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `apartment-${Date.now()}`;
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadCustomApartments() {
  try {
    const saved = localStorage.getItem(apartmentStorageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function normalizeApartment(form) {
  const images = [...form.images, form.imageUrl].filter(Boolean);

  return {
    id: form.id || `custom-${slugify(form.apartmentName)}`,
    apartmentName: form.apartmentName,
    location: form.location,
    addressArea: form.addressArea,
    shortDescription: form.shortDescription,
    fullDescription: form.fullDescription || form.shortDescription,
    pricePerNight: Number(form.pricePerNight || 0),
    pricePerWeek: Number(form.pricePerWeek || 0),
    pricePerMonth: Number(form.pricePerMonth || 0),
    cleaningFee: Number(form.cleaningFee || 0),
    securityDeposit: Number(form.securityDeposit || 0),
    maxGuests: Number(form.maxGuests || 1),
    bedrooms: Number(form.bedrooms || 1),
    bathrooms: Number(form.bathrooms || 1),
    propertyType: form.propertyType,
    availabilityStatus: form.availabilityStatus,
    availableDates: splitList(form.availableDates),
    amenities: splitList(form.amenities),
    images: images.length ? images : ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85'],
    houseRules: splitList(form.houseRules),
    cancellationPolicy: form.cancellationPolicy,
    isCustom: true,
  };
}

function apartmentToForm(apartment) {
  return {
    ...emptyApartmentForm,
    ...apartment,
    availableDates: (apartment.availableDates || []).join(', '),
    amenities: (apartment.amenities || []).join(', '),
    houseRules: (apartment.houseRules || []).join(', '),
    images: apartment.images || [],
    imageUrl: '',
  };
}

function useApartmentListings() {
  const [customApartments, setCustomApartments] = useState(() => loadCustomApartments());

  const saveCustomApartments = (nextApartments) => {
    setCustomApartments(nextApartments);
    localStorage.setItem(apartmentStorageKey, JSON.stringify(nextApartments));
  };

  return {
    listings: useMemo(() => [...apartments, ...customApartments], [customApartments]),
    customApartments,
    saveCustomApartments,
  };
}

function getPageName() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  return page === '' ? 'index.html' : page;
}

function money(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

function AnimatedCounter({ value, suffix, trigger }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return undefined;
    const start = performance.now();
    const duration = 1400;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, value]);

  return (
    <span className="stat-value">
      {count}
      {suffix}
    </span>
  );
}

function Header({ menuOpen, setMenuOpen, darkMode, setDarkMode }) {
  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>Welcome to KAVARO Holdings Ltd</span>
          <div className="top-links">
            <a href="mailto:info@kavaro-holdings.com">info@kavaro-holdings.com</a>
            <a href="tel:+447307339657">+44 7307 339657</a>
            <span>London, United Kingdom</span>
          </div>
        </div>
      </div>
      <div className="container header-inner">
        <a className="brand" href="index.html" aria-label="KAVARO Holdings Ltd home">
          <img src={logo} alt="KAVARO Holdings Ltd logo" />
        </a>
        <nav className={`site-nav ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => item.children ? (
            <div className="nav-group" key={item.href}>
              <a href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
              <div className="nav-dropdown">
                {item.children.map((child) => (
                  <a key={child.href} href={child.href} onClick={() => setMenuOpen(false)}>
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" type="button" onClick={() => setDarkMode((current) => !current)} aria-label="Toggle dark mode">
            {darkMode ? 'Light' : 'Dark'}
          </button>
          <a className="btn btn-primary header-cta" href="contact.html">
            Get in Touch
          </a>
          <button className="nav-toggle" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen((current) => !current)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

function PageHero({ kicker, title, text, actions, image }) {
  return (
    <section className="hero page-hero" style={image ? { backgroundImage: `linear-gradient(90deg, rgba(5,17,31,.94), rgba(7,27,52,.58)), url("${image}")` } : undefined}>
      <div className="container hero-grid single">
        <div className="hero-content">
          <span className="eyebrow">{kicker}</span>
          <h1>{title}</h1>
          <p>{text}</p>
          {actions && <div className="hero-actions">{actions}</div>}
        </div>
      </div>
    </section>
  );
}

function BusinessCards() {
  return (
    <div className="pillar-grid">
      {businessCards.map((card) => (
        <a className="pillar-card clickable-card" href={card.href} key={card.title}>
          <img src={card.image} alt={`${card.title} business visual`} />
          <div className="pillar-body">
            <span>{card.label}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <strong>View details</strong>
          </div>
        </a>
      ))}
    </div>
  );
}

function SocialImpactSection() {
  return (
    <section className="section social-impact">
      <div className="container split-grid">
        <div className="copy-block">
          <span className="section-kicker">Our Social Impact / Humanitarian Subsidiary</span>
          <h2>Zion Youth Development Initiative</h2>
          <p>
            KAVARO Holdings Ltd supports humanitarian and youth development work through Zion Youth
            Development Initiative, with a focus on education support, skills development,
            community development, youth empowerment and practical humanitarian support.
          </p>
          <a className="btn btn-primary" href="https://www.zionyouths.org" target="_blank" rel="noreferrer">
            Visit Zion Youth Development Initiative
          </a>
        </div>
        <div className="impact-panel">
          <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80" alt="Community development and youth support" />
        </div>
      </div>
    </section>
  );
}

function HomePage({ animateStats, statsRef }) {
  return (
    <>
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">Kingdom Assets, Ventures & Resource Operations</span>
            <h1>
              Building diversified value across <span>property, technology, trade and investment.</span>
            </h1>
            <p>
              KAVARO Holdings Ltd is a diversified corporate group created to identify, develop,
              acquire and manage high-value opportunities across multiple industries.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="businesses.html">Explore Our Businesses</a>
              <a className="btn btn-secondary" href="stays.html">View Stays/Apartments</a>
            </div>
          </div>
          <aside className="hero-panel" aria-label="KAVARO positioning">
            <img src={logo} alt="" />
            <p>Trust. Stability. Growth. Excellence. Innovation. Global reach.</p>
          </aside>
        </div>
      </section>

      <ValueStrip />
      <AboutSummary />

      <section className="section businesses">
        <div className="container">
          <div className="section-header align-left">
            <span className="section-kicker">Our Businesses</span>
            <h2>Four pillars. One vision.</h2>
            <p>Each KAVARO business card now links to its dedicated corporate section.</p>
          </div>
          <BusinessCards />
        </div>
      </section>

      <StatsSection animateStats={animateStats} statsRef={statsRef} />
      <InvestmentSection />
      <SocialImpactSection />
      <InsightsSection />
      <ContactCta />
    </>
  );
}

function ValueStrip() {
  return (
    <section className="value-strip" aria-label="Corporate values">
      <div className="container value-strip-inner">
        {['Integrity', 'Excellence', 'Innovation', 'Impact'].map((value) => (
          <div key={value} className="value-item">
            <span>{value.slice(0, 1)}</span>
            <p>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSummary() {
  return (
    <section className="section intro-section">
      <div className="container split-grid">
        <div className="copy-block">
          <span className="section-kicker">About Us</span>
          <h2>Corporate leadership with global ambition.</h2>
          <p>
            KAVARO Holdings Ltd exists to build long-term value through strategic investments,
            operational excellence, responsible partnerships and disciplined business leadership.
            The company is structured for future expansion across property, technology, trading,
            ventures, acquisitions and corporate partnerships.
          </p>
          <div className="mission-grid">
            <article>
              <h3>Vision</h3>
              <p>To become a globally respected holding company creating sustainable value.</p>
            </article>
            <article>
              <h3>Mission</h3>
              <p>To manage high-value opportunities while delivering long-term stakeholder impact.</p>
            </article>
          </div>
        </div>
        <article className="founder-card">
          <img src={founderPhoto} alt="Tayo Obademi, Founder and President of KAVARO Holdings Ltd" />
          <div>
            <span>Founder's Message</span>
            <h3>Tayo Obademi</h3>
            <p>Founder & President, KAVARO Holdings Ltd</p>
            <blockquote>
              KAVARO is being built as a premium corporate platform for strategic growth,
              strong partnerships and responsible enterprise leadership.
            </blockquote>
          </div>
        </article>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About KAVARO"
        title="A premium diversified holding company."
        text="KAVARO Holdings Ltd brings property, technology, trading, investments and social impact into one disciplined corporate platform."
      />
      <ValueStrip />
      <AboutSummary />
      <section className="section governance">
        <div className="container governance-grid">
          <article>
            <span className="section-kicker">Governance</span>
            <h2>Built for investor confidence.</h2>
            <p>KAVARO's future operating model supports board oversight, advisory expertise, reporting discipline and UK data protection awareness.</p>
          </article>
          <article>
            <h3>Core Values</h3>
            <p>{values.join(', ')}.</p>
          </article>
          <article>
            <h3>ESG & Sustainability</h3>
            <p>The group will pursue responsible environmental conduct, social impact and transparent governance as it expands.</p>
          </article>
        </div>
      </section>
      <SocialImpactSection />
    </>
  );
}

function BusinessesPage() {
  return (
    <>
      <PageHero
        kicker="Our Businesses"
        title="Four focused divisions with room for enterprise expansion."
        text="Explore KAVARO Properties, KAVARO Technologies, KAVARO Trading and KAVARO Ventures."
      />
      <section className="section businesses">
        <div className="container">
          <BusinessCards />
        </div>
      </section>
    </>
  );
}

function PropertiesPage() {
  return (
    <>
      <PageHero
        kicker="KAVARO Properties"
        title="Property investment, rentals and future real estate projects."
        text="A property division covering buy-to-let opportunities, short-stay apartments, serviced accommodation and future development projects."
        actions={<><a className="btn btn-primary" href="stays.html">View Stays/Apartments</a><a className="btn btn-secondary" href="contact.html">Property Enquiry</a></>}
        image="https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="section intro-section">
        <div className="container service-grid">
          {['Property investment activities', 'Buy-to-let opportunities', 'Short-stay apartments', 'Serviced accommodation', 'Available apartment rentals', 'Future real estate projects'].map((item) => (
            <article className="service-card" key={item}>
              <h3>{item}</h3>
              <p>KAVARO Properties is prepared to manage this area as part of a premium, growth-focused property platform.</p>
            </article>
          ))}
        </div>
      </section>
      <StaysPreview />
    </>
  );
}

function TechnologiesPage() {
  return (
    <>
      <PageHero
        kicker="KAVARO Technologies"
        title="Technology consultancy, software delivery and digital automation."
        text="A technology division serving organisations that need practical IT strategy, web platforms, software development, AI automation and future digital products."
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="section intro-section">
        <div className="container service-grid">
          {['IT Consultancy', 'Web Development', 'Software Development', 'AI and Automation', 'Student/Developer Projects', 'Future Technology Products'].map((item) => (
            <article className="service-card" key={item}>
              <h3>{item}</h3>
              <p>Professional technology support aligned with the KAVARO brand and future product roadmap.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section investments">
        <div className="container profile-links">
          <div className="copy-block">
            <span className="section-kicker">Online Profiles</span>
            <h2>Portfolio, GitHub and LinkedIn.</h2>
            <p>Replace # with Tayo Obademi's real portfolio, GitHub and LinkedIn links when available.</p>
          </div>
          <a className="btn btn-primary" href="#">Portfolio</a>
          <a className="btn btn-secondary tech-link" href="#">GitHub</a>
          <a className="btn btn-secondary tech-link" href="#">LinkedIn</a>
        </div>
      </section>
    </>
  );
}

function TradingPage() {
  return (
    <>
      <PageHero
        kicker="KAVARO Trading"
        title="Import/export and supply chain partnerships."
        text="KAVARO Trading is positioned for wholesale distribution, market connectivity and trade opportunities across the UK, Nigeria, the US and Canada."
        image="https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="section intro-section">
        <div className="container service-grid">
          {['Import/export', 'Wholesale distribution', 'Supply chain partnerships', 'UK trade opportunities', 'Nigeria trade opportunities', 'US and Canada trade opportunities'].map((item) => (
            <article className="service-card" key={item}>
              <h3>{item}</h3>
              <p>Structured for credible market relationships, reliable operations and responsible cross-border growth.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function VenturesPage() {
  return (
    <>
      <PageHero
        kicker="KAVARO Ventures"
        title="Strategic partnerships, acquisitions and investment opportunities."
        text="KAVARO Ventures supports business acquisitions, startup support and partnerships that can strengthen the wider KAVARO ecosystem."
        image="https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="section intro-section">
        <div className="container service-grid">
          {['Strategic partnerships', 'Business acquisitions', 'Startup support', 'Investment opportunities'].map((item) => (
            <article className="service-card" key={item}>
              <h3>{item}</h3>
              <p>Opportunities are reviewed for growth potential, governance, market fundamentals and ecosystem fit.</p>
            </article>
          ))}
        </div>
      </section>
      <SocialImpactSection />
    </>
  );
}

function StaysPreview() {
  const { listings } = useApartmentListings();

  return (
    <section className="section stays-preview">
      <div className="container">
        <div className="section-header align-left">
          <span className="section-kicker">KAVARO Stays</span>
          <h2>Available apartments and serviced accommodation.</h2>
          <p>Short-stay, long-stay and serviced rental information can be managed from the front-end apartment editor.</p>
        </div>
        <ApartmentGrid apartments={listings.slice(0, 3)} />
      </div>
    </section>
  );
}

function ApartmentGrid({ apartments: items }) {
  return (
    <div className="apartment-grid">
      {items.map((apartment) => (
        <article className="apartment-card" key={apartment.id}>
          <img src={apartment.images[0]} alt={apartment.apartmentName} />
          <div className="apartment-card-body">
            <span className={`status ${apartment.availabilityStatus.toLowerCase().replaceAll(' ', '-')}`}>{apartment.availabilityStatus}</span>
            <h3>{apartment.apartmentName}</h3>
            <p>{apartment.location}</p>
            <div className="apartment-facts">
              <span>{apartment.bedrooms} bed</span>
              <span>{apartment.bathrooms} bath</span>
              <span>{apartment.maxGuests} guests</span>
            </div>
            <strong>{money(apartment.pricePerNight)} / night</strong>
            <div className="card-actions">
              <a className="btn btn-secondary tech-link" href={`apartment-details.html?id=${apartment.id}`}>View Details</a>
              <a className="btn btn-primary" href={`booking.html?id=${apartment.id}`}>Book Now</a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function StaysPage() {
  const { listings, customApartments, saveCustomApartments } = useApartmentListings();
  const [filters, setFilters] = useState({
    location: '',
    maxPrice: '',
    guests: '',
    bedrooms: '',
    checkIn: '',
    checkOut: '',
    stayType: '',
  });

  const filteredApartments = useMemo(() => listings.filter((apartment) => {
    const matchesLocation = !filters.location || apartment.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesPrice = !filters.maxPrice || apartment.pricePerNight <= Number(filters.maxPrice);
    const matchesGuests = !filters.guests || apartment.maxGuests >= Number(filters.guests);
    const matchesBedrooms = !filters.bedrooms || apartment.bedrooms >= Number(filters.bedrooms);
    const matchesStayType = !filters.stayType || apartment.propertyType.toLowerCase().includes(filters.stayType.toLowerCase()) || apartment.amenities.join(' ').toLowerCase().includes(filters.stayType.toLowerCase());
    return matchesLocation && matchesPrice && matchesGuests && matchesBedrooms && matchesStayType;
  }), [filters, listings]);

  return (
    <>
      <PageHero
        kicker="KAVARO Stays"
        title="Premium apartment listings and booking preparation."
        text="Browse available apartments, serviced accommodation and rental properties. Card payments can be handled securely through Stripe when configured in Vercel."
        image="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="section intro-section">
        <div className="container">
          <ApartmentFilters filters={filters} setFilters={setFilters} />
          <AdminGate>
            <ApartmentManager customApartments={customApartments} saveCustomApartments={saveCustomApartments} />
          </AdminGate>
          <ApartmentGrid apartments={filteredApartments} />
          <LegalNotices />
        </div>
      </section>
    </>
  );
}

function ApartmentFilters({ filters, setFilters }) {
  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="filter-panel">
      <input name="location" value={filters.location} onChange={update} placeholder="Location" />
      <input name="maxPrice" value={filters.maxPrice} onChange={update} type="number" min="0" placeholder="Max price/night" />
      <input name="guests" value={filters.guests} onChange={update} type="number" min="1" placeholder="Guests" />
      <input name="bedrooms" value={filters.bedrooms} onChange={update} type="number" min="1" placeholder="Bedrooms" />
      <input name="checkIn" value={filters.checkIn} onChange={update} type="date" aria-label="Check-in date" />
      <input name="checkOut" value={filters.checkOut} onChange={update} type="date" aria-label="Check-out date" />
      <select name="stayType" value={filters.stayType} onChange={update}>
        <option value="">Stay type</option>
        <option value="short">Short stay</option>
        <option value="long">Long stay</option>
        <option value="serviced">Serviced accommodation</option>
      </select>
    </form>
  );
}

function AdminGate({ children }) {
  const [session, setSession] = useState({ loading: true, authenticated: false, email: '' });
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');

  const readApiResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Admin API is not available on this local server. Use Vercel deployment or run the site with vercel dev.');
    }
  };

  useEffect(() => {
    fetch('/api/admin-session')
      .then(readApiResponse)
      .then((data) => setSession({ loading: false, authenticated: Boolean(data.authenticated), email: data.email || '' }))
      .catch(() => setSession({ loading: false, authenticated: false, email: '' }));
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const login = async (event) => {
    event.preventDefault();
    setStatus('Checking admin access...');

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await readApiResponse(response);

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error || 'Admin access denied.');
      }

      setSession({ loading: false, authenticated: true, email: data.email });
      setCredentials({ email: '', password: '' });
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const logout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => undefined);
    setSession({ loading: false, authenticated: false, email: '' });
    setStatus('');
  };

  if (session.loading) {
    return (
      <section className="admin-panel">
        <p className="form-status">Checking admin session...</p>
      </section>
    );
  }

  if (!session.authenticated) {
    return (
      <section className="admin-panel" aria-label="Admin login">
        <div className="section-header align-left">
          <span className="section-kicker">Admin Access</span>
          <h2>Sign in to manage apartment listings.</h2>
          <p>Only authorised KAVARO administrators can create or edit guest-ready listings.</p>
          <p>For local testing, run with Vercel Dev so the admin API routes are available.</p>
        </div>
        <form className="manager-form" onSubmit={login} noValidate>
          <div className="form-row">
            <label>Email<input name="email" type="email" value={credentials.email} onChange={update} required /></label>
            <label>Password<input name="password" type="password" value={credentials.password} onChange={update} required /></label>
          </div>
          <button className="btn btn-primary" type="submit">Admin Sign In</button>
          {status && <p className="form-status">{status}</p>}
        </form>
      </section>
    );
  }

  return (
    <>
      <section className="admin-session-bar">
        <span>Signed in as {session.email}</span>
        <button type="button" onClick={logout}>Sign Out</button>
      </section>
      {children}
    </>
  );
}

function ApartmentManager({ customApartments, saveCustomApartments }) {
  const [form, setForm] = useState(emptyApartmentForm);
  const [status, setStatus] = useState('');

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const imageData = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));

    setForm((current) => ({ ...current, images: [...current.images, ...imageData] }));
    event.target.value = '';
  };

  const submit = (event) => {
    event.preventDefault();
    setStatus('');

    if (!form.apartmentName || !form.location || !form.pricePerNight || !form.shortDescription) {
      setStatus('Please complete apartment name, location, nightly price and short description.');
      return;
    }

    const apartment = normalizeApartment(form);
    const nextApartments = customApartments.some((item) => item.id === apartment.id)
      ? customApartments.map((item) => (item.id === apartment.id ? apartment : item))
      : [...customApartments, apartment];

    saveCustomApartments(nextApartments);
    setForm(emptyApartmentForm);
    setStatus(`${apartment.apartmentName} has been saved.`);
  };

  const editApartment = (apartment) => {
    setForm(apartmentToForm(apartment));
    setStatus(`Editing ${apartment.apartmentName}.`);
  };

  const deleteApartment = (apartmentId) => {
    saveCustomApartments(customApartments.filter((item) => item.id !== apartmentId));
    if (form.id === apartmentId) setForm(emptyApartmentForm);
    setStatus('Apartment removed from the front-end list.');
  };

  const removeImage = (image) => {
    setForm((current) => ({ ...current, images: current.images.filter((item) => item !== image) }));
  };

  return (
    <section className="apartment-manager" aria-label="Apartment manager">
      <div className="section-header align-left">
        <span className="section-kicker">Apartment Manager</span>
        <h2>Create or edit guest-ready listings.</h2>
        <p>Saved listings appear immediately on this page, the details page and booking page in this browser.</p>
      </div>
      <form className="manager-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Apartment name<input name="apartmentName" value={form.apartmentName} onChange={update} required /></label>
          <label>Location<input name="location" value={form.location} onChange={update} placeholder="London, United Kingdom" required /></label>
        </div>
        <label>Address area<input name="addressArea" value={form.addressArea} onChange={update} placeholder="Canary Wharf / East London" /></label>
        <label>Short description<textarea name="shortDescription" rows="3" value={form.shortDescription} onChange={update} required /></label>
        <label>Full guest description<textarea name="fullDescription" rows="5" value={form.fullDescription} onChange={update} /></label>
        <div className="form-row">
          <label>Nightly price (£)<input name="pricePerNight" value={form.pricePerNight} onChange={update} type="number" min="0" required /></label>
          <label>Weekly price (£)<input name="pricePerWeek" value={form.pricePerWeek} onChange={update} type="number" min="0" /></label>
        </div>
        <div className="form-row">
          <label>Monthly price (£)<input name="pricePerMonth" value={form.pricePerMonth} onChange={update} type="number" min="0" /></label>
          <label>Cleaning fee (£)<input name="cleaningFee" value={form.cleaningFee} onChange={update} type="number" min="0" /></label>
        </div>
        <div className="form-row">
          <label>Security deposit (£)<input name="securityDeposit" value={form.securityDeposit} onChange={update} type="number" min="0" /></label>
          <label>Availability<select name="availabilityStatus" value={form.availabilityStatus} onChange={update}>
            <option>Available</option>
            <option>Limited Availability</option>
            <option>Reserved</option>
            <option>Unavailable</option>
          </select></label>
        </div>
        <div className="form-row">
          <label>Guests<input name="maxGuests" value={form.maxGuests} onChange={update} type="number" min="1" /></label>
          <label>Bedrooms<input name="bedrooms" value={form.bedrooms} onChange={update} type="number" min="0" /></label>
        </div>
        <div className="form-row">
          <label>Bathrooms<input name="bathrooms" value={form.bathrooms} onChange={update} type="number" min="0" /></label>
          <label>Property type<input name="propertyType" value={form.propertyType} onChange={update} /></label>
        </div>
        <label>Amenities, separated by commas<input name="amenities" value={form.amenities} onChange={update} placeholder="Wi-Fi, Kitchen, Parking" /></label>
        <label>House rules, separated by commas<input name="houseRules" value={form.houseRules} onChange={update} placeholder="No smoking indoors, No parties" /></label>
        <label>Available dates, separated by commas<input name="availableDates" value={form.availableDates} onChange={update} placeholder="2026-06-10, 2026-06-11" /></label>
        <label>Cancellation policy<textarea name="cancellationPolicy" rows="3" value={form.cancellationPolicy} onChange={update} /></label>
        <div className="form-row">
          <label>Upload apartment photos<input type="file" accept="image/*" multiple onChange={uploadImages} /></label>
          <label>Or image URL<input name="imageUrl" value={form.imageUrl} onChange={update} placeholder="https://..." /></label>
        </div>
        {form.images.length > 0 && (
          <div className="image-preview-grid">
            {form.images.map((image) => (
              <button type="button" key={image} onClick={() => removeImage(image)} aria-label="Remove uploaded photo">
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        )}
        <div className="manager-actions">
          <button className="btn btn-primary" type="submit">{form.id ? 'Update Apartment' : 'Create Apartment'}</button>
          <button className="btn btn-secondary tech-link" type="button" onClick={() => setForm(emptyApartmentForm)}>Clear Form</button>
        </div>
        {status && <p className="form-status">{status}</p>}
      </form>
      {customApartments.length > 0 && (
        <div className="managed-list">
          {customApartments.map((apartment) => (
            <article key={apartment.id}>
              <div>
                <strong>{apartment.apartmentName}</strong>
                <span>{apartment.location}</span>
              </div>
              <button type="button" onClick={() => editApartment(apartment)}>Edit</button>
              <button type="button" onClick={() => deleteApartment(apartment.id)}>Delete</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ApartmentDetailsPage() {
  const { listings } = useApartmentListings();
  const params = new URLSearchParams(window.location.search);
  const apartment = listings.find((item) => item.id === params.get('id')) || listings[0];
  const similar = listings.filter((item) => item.id !== apartment.id).slice(0, 2);

  return (
    <>
      <PageHero
        kicker="Apartment Details"
        title={apartment.apartmentName}
        text={`${apartment.location} - ${apartment.shortDescription}`}
        image={apartment.images[0]}
        actions={<a className="btn btn-primary" href={`booking.html?id=${apartment.id}`}>Book This Apartment</a>}
      />
      <section className="section intro-section">
        <div className="container details-grid">
          <div>
            <div className="gallery-grid">
              {apartment.images.map((image) => (
                <img key={image} src={image} alt={`${apartment.apartmentName} gallery`} />
              ))}
            </div>
            <h2>{apartment.apartmentName}</h2>
            <p>{apartment.fullDescription}</p>
            <InfoList title="Amenities" items={apartment.amenities} />
            <InfoList title="House Rules" items={apartment.houseRules} />
            <LegalNotices />
          </div>
          <aside className="booking-panel">
            <h3>Price Breakdown</h3>
            <p><strong>Nightly:</strong> {money(apartment.pricePerNight)}</p>
            <p><strong>Weekly:</strong> {money(apartment.pricePerWeek)}</p>
            <p><strong>Monthly:</strong> {money(apartment.pricePerMonth)}</p>
            <p><strong>Cleaning fee:</strong> {money(apartment.cleaningFee)}</p>
            <p><strong>Security deposit:</strong> {money(apartment.securityDeposit)}</p>
            <p><strong>Status:</strong> {apartment.availabilityStatus}</p>
            <p><strong>Cancellation:</strong> {apartment.cancellationPolicy}</p>
            <a className="btn btn-primary" href={`booking.html?id=${apartment.id}`}>Book Now</a>
          </aside>
        </div>
      </section>
      <section className="section stays-preview">
        <div className="container">
          <div className="section-header align-left">
            <span className="section-kicker">Similar Apartments</span>
            <h2>More KAVARO Stays options.</h2>
          </div>
          <ApartmentGrid apartments={similar} />
        </div>
      </section>
    </>
  );
}

function InfoList({ title, items }) {
  return (
    <div className="info-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function BookingPage() {
  const { listings } = useApartmentListings();
  const params = new URLSearchParams(window.location.search);
  const apartment = listings.find((item) => item.id === params.get('id')) || listings[0];
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', checkIn: '', checkOut: '', guests: '1', message: '' });
  const [error, setError] = useState('');
  const nights = nightsBetween(form.checkIn, form.checkOut);
  const total = nights * apartment.pricePerNight + apartment.cleaningFee + apartment.securityDeposit;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.phone || !form.checkIn || !form.checkOut || !form.guests) {
      setError('Please complete all required booking fields.');
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be later than check-in date.');
      return;
    }

    const summary = { apartment, guest: form, nights, total };
    localStorage.setItem('kavaroBookingSummary', JSON.stringify(summary));
    window.location.href = 'payment.html';
  };

  return (
    <>
      <PageHero
        kicker="Booking"
        title={`Book ${apartment.apartmentName}`}
        text="Complete the form to prepare your booking summary, then continue to payment."
        image={apartment.images[0]}
      />
      <section className="section intro-section">
        <div className="container contact-grid">
          <form className="contact-form" onSubmit={submit} noValidate>
            <label>Full name<input name="fullName" value={form.fullName} onChange={update} required /></label>
            <div className="form-row">
              <label>Email address<input name="email" type="email" value={form.email} onChange={update} required /></label>
              <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} required /></label>
            </div>
            <div className="form-row">
              <label>Check-in date<input name="checkIn" type="date" value={form.checkIn} onChange={update} required /></label>
              <label>Check-out date<input name="checkOut" type="date" value={form.checkOut} min={form.checkIn || undefined} onChange={update} required /></label>
            </div>
            <label>Number of guests<input name="guests" type="number" min="1" max={apartment.maxGuests} value={form.guests} onChange={update} required /></label>
            <label>Special request/message<textarea name="message" rows="5" value={form.message} onChange={update} /></label>
            <button className="btn btn-primary" type="submit">Continue to Payment Summary</button>
            {error && <p className="form-status">{error}</p>}
          </form>
          <PriceBreakdown apartment={apartment} nights={nights} total={total} />
        </div>
      </section>
    </>
  );
}

function PriceBreakdown({ apartment, nights, total }) {
  return (
    <aside className="booking-panel">
      <h3>Live Price Breakdown</h3>
      <p><strong>Apartment:</strong> {apartment.apartmentName}</p>
      <p><strong>Nightly rate:</strong> {money(apartment.pricePerNight)}</p>
      <p><strong>Nights:</strong> {nights}</p>
      <p><strong>Cleaning fee:</strong> {money(apartment.cleaningFee)}</p>
      <p><strong>Security deposit:</strong> {money(apartment.securityDeposit)}</p>
      <p className="total-price"><strong>Total:</strong> {money(total)}</p>
      <LegalNotices />
    </aside>
  );
}

function PaymentPage() {
  const [summary, setSummary] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kavaroBookingSummary');
    if (saved) setSummary(JSON.parse(saved));
  }, []);

  const startStripeCheckout = async () => {
    if (!summary) {
      setPaymentStatus('Please start from the booking page before paying.');
      return;
    }

    setPaymentStatus('Preparing secure Stripe checkout...');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Stripe API is not available on this local server. Use Vercel deployment or run the site with vercel dev.');
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Unable to start Stripe checkout.');
      }

      window.location.href = data.url;
    } catch (error) {
      setPaymentStatus(error.message);
    }
  };

  return (
    <>
      <PageHero
        kicker="Payment"
        title="Secure card payment with Stripe."
        text="Review the booking summary, then continue to Stripe Checkout to enter card details securely."
      />
      <section className="section intro-section">
        <div className="container payment-grid">
          <aside className="booking-panel">
            <h3>Booking Summary</h3>
            {summary ? (
              <>
                <p><strong>Apartment:</strong> {summary.apartment.apartmentName}</p>
                <p><strong>Guest:</strong> {summary.guest.fullName}</p>
                <p><strong>Check-in:</strong> {summary.guest.checkIn}</p>
                <p><strong>Check-out:</strong> {summary.guest.checkOut}</p>
                <p><strong>Nights:</strong> {summary.nights}</p>
                <p><strong>Cleaning fee:</strong> {money(summary.apartment.cleaningFee)}</p>
                <p><strong>Security deposit:</strong> {money(summary.apartment.securityDeposit)}</p>
                <p className="total-price"><strong>Total:</strong> {money(summary.total)}</p>
              </>
            ) : (
              <p>No booking summary found. Please start from the booking page.</p>
            )}
          </aside>
          <div className="payment-options">
            <button type="button" className="payment-option payment-option-active" onClick={startStripeCheckout}>
              <strong>Debit/Credit Card</strong>
              <span>Continue to secure card payment</span>
            </button>
            <p className="payment-note">Card details are entered securely on Stripe. KAVARO does not store card numbers.</p>
            {paymentStatus && <p className="form-status">{paymentStatus}</p>}
          </div>
        </div>
      </section>
    </>
  );
}

function LegalNotices() {
  return (
    <div className="legal-notices">
      <h3>Booking Notices</h3>
      <ul>
        {bookingNotices.map((notice) => <li key={notice}>{notice}</li>)}
      </ul>
    </div>
  );
}

function StatsSection({ animateStats, statsRef }) {
  return (
    <section className="section statistics" ref={statsRef} aria-label="Corporate statistics">
      <div className="container stats-grid">
        {stats.map((item) => (
          <article key={item.label} className="stat-card">
            <AnimatedCounter value={item.value} suffix={item.suffix} trigger={animateStats} />
            <p>{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function InvestmentSection() {
  return (
    <section className="section investments">
      <div className="container investment-grid">
        <div className="copy-block">
          <span className="section-kicker">Investment Portfolio</span>
          <h2>Disciplined capital allocation across resilient sectors.</h2>
          <p>KAVARO focuses on sectors where operational excellence, strategic partnerships and long-term demand can combine to create durable value.</p>
          <div className="focus-list">
            {focusAreas.map((area) => <span key={area}>{area}</span>)}
          </div>
        </div>
        <div className="investment-panel">
          <h3>Investment Criteria</h3>
          <ol>
            <li>Clear growth potential and strong market fundamentals.</li>
            <li>Credible partners, measurable governance and responsible operations.</li>
            <li>Opportunities that can strengthen the wider KAVARO ecosystem.</li>
          </ol>
          <a className="text-link" href="contact.html">Discuss partnership opportunities</a>
        </div>
      </div>
    </section>
  );
}

function InvestmentsPage() {
  return (
    <>
      <PageHero kicker="Investments" title="Strategic investment focus for long-term value." text="KAVARO targets durable sectors including property, technology, logistics, infrastructure, education, healthcare and financial technology." />
      <InvestmentSection />
    </>
  );
}

function CsrPage() {
  return (
    <>
      <PageHero kicker="CSR" title="Community impact through youth development and humanitarian support." text="KAVARO Holdings Ltd supports social impact through Zion Youth Development Initiative." image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=85" />
      <section className="section intro-section">
        <div className="container service-grid">
          {['Youth empowerment', 'Education support', 'Skills development', 'Community development', 'Humanitarian support', 'Faith-Based Community Partnerships'].map((item) => (
            <article className="service-card" key={item}>
              <h3>{item}</h3>
              <p>
                {item === 'Faith-Based Community Partnerships'
                  ? 'KAVARO Holdings Ltd supports responsible community engagement through partnerships with faith-based and charitable organisations, including The Church of Jesus Christ of Latter-day Saints, where appropriate.'
                  : 'Zion Youth Development Initiative provides a focused channel for this social impact priority.'}
              </p>
            </article>
          ))}
        </div>
      </section>
      <SocialImpactSection />
    </>
  );
}

function InsightsSection() {
  return (
    <section className="section insights">
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">Newsroom & Insights</span>
          <h2>Leadership articles and market updates.</h2>
          <p>A future editorial hub for corporate news, property insight, technology commentary, trade intelligence and investment thinking.</p>
        </div>
        <div className="insight-grid">
          {['Strategic Growth in Real Estate', 'Digital Innovation and AI Solutions', 'Global Trade Expansion'].map((title) => (
            <article key={title} className="insight-card">
              <span>Insight</span>
              <h3>{title}</h3>
              <p>Prepared as a future article category for KAVARO's investor and partner audience.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferencesPage() {
  return (
    <>
      <PageHero kicker="Insights & References" title="Future newsroom, references and legal resources." text="This page prepares KAVARO for articles, company references, privacy policy, terms, cookie policy, accessibility statement and disclaimers." />
      <InsightsSection />
      <section className="section intro-section">
        <div className="container service-grid">
          {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Accessibility Statement', 'Disclaimer'].map((item) => (
            <article className="service-card" key={item}>
              <h3>{item}</h3>
              <p>Prepared for future legal copy and compliance review.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ContactCta() {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <div>
          <span className="section-kicker">Partnership Enquiries</span>
          <h2>Start a serious conversation with KAVARO Holdings Ltd.</h2>
        </div>
        <a className="btn btn-primary" href="contact.html">Contact Our Team</a>
      </div>
    </section>
  );
}

function ContactPage() {
  const [formStatus, setFormStatus] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      setFormStatus('Please complete the required enquiry details.');
      return;
    }
    setFormStatus('Thank you. Your enquiry has been prepared for the KAVARO team.');
    event.currentTarget.reset();
  };

  return (
    <>
      <PageHero kicker="Contact Us" title="Investor, partner and corporate enquiries." text="Use the form for investment opportunities, partnerships, acquisitions, technology, trading, property or general corporate enquiries." />
      <section className="section contact">
        <div className="container contact-grid">
          <div className="copy-block">
            <span className="section-kicker">Corporate Information</span>
            <h2>Reach KAVARO Holdings Ltd.</h2>
            <div className="contact-details">
              <p><strong>Email</strong><a href="mailto:info@kavaro-holdings.com">info@kavaro-holdings.com</a></p>
              <p><strong>Phone</strong><a href="tel:+447307339657">+44 7307 339657</a></p>
              <p><strong>Location</strong>London, United Kingdom</p>
              <p><strong>Business Hours</strong>Monday to Friday, 9:00 AM to 5:30 PM</p>
            </div>
          </div>
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="form-row">
              <label>Name<input type="text" name="name" placeholder="Your name" required /></label>
              <label>Company<input type="text" name="company" placeholder="Company name" /></label>
            </div>
            <div className="form-row">
              <label>Email<input type="email" name="email" placeholder="name@example.com" required /></label>
              <label>Phone<input type="tel" name="phone" placeholder="Phone number" /></label>
            </div>
            <div className="form-row">
              <label>Country<input type="text" name="country" placeholder="Country" /></label>
              <label>Enquiry Type<select name="type" required defaultValue=""><option value="" disabled>Select enquiry</option><option>Investment</option><option>Partnership</option><option>Property</option><option>Technology</option><option>Trading</option><option>Apartment Booking</option><option>General</option></select></label>
            </div>
            <label>Message<textarea name="message" rows="5" placeholder="Tell us about your enquiry" required /></label>
            <button type="submit" className="btn btn-secondary">Send Enquiry</button>
            {formStatus && <p className="form-status">{formStatus}</p>}
          </form>
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <img src={logo} alt="KAVARO Holdings Ltd" />
          <p>KAVARO Holdings Ltd is the digital headquarters for a premium diversified corporate group spanning property, technology, trade and investment.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
      </div>
      <div className="container footer-bottom">
        <p>Copyright 2026 KAVARO Holdings Ltd. All rights reserved.</p>
        <p>Prepared for GitHub Pages deployment and future enterprise expansion.</p>
      </div>
    </footer>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('kavaroTheme') !== 'light');
  const [animateStats, setAnimateStats] = useState(false);
  const statsRef = useRef(null);
  const page = getPageName();

  useEffect(() => {
    localStorage.setItem('kavaroTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateStats(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [page]);

  const pageComponent = {
    'index.html': <HomePage animateStats={animateStats} statsRef={statsRef} />,
    'about.html': <AboutPage />,
    'businesses.html': <BusinessesPage />,
    'properties.html': <PropertiesPage />,
    'technologies.html': <TechnologiesPage />,
    'trading.html': <TradingPage />,
    'ventures.html': <VenturesPage />,
    'stays.html': <StaysPage />,
    'apartment-details.html': <ApartmentDetailsPage />,
    'booking.html': <BookingPage />,
    'payment.html': <PaymentPage />,
    'investments.html': <InvestmentsPage />,
    'csr.html': <CsrPage />,
    'references.html': <ReferencesPage />,
    'contact.html': <ContactPage />,
  }[page] || <HomePage animateStats={animateStats} statsRef={statsRef} />;

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main>{pageComponent}</main>
      <Footer />
    </div>
  );
}

export default App;
