import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apartments from '../data/apartments.json';
import logo from '../images/logo_kavaro holdings .png';
import founderPhoto from '../images/ty21_founder and CEO .png';
import founderProfilePhoto from '../images/ty21_founder and CEO .png';
import partnersMeetingPhoto from '../images/kavaro partners1.png';
import partnersVenturesPhoto from '../images/kavaro ventures.png';

const navItems = [
  { label: 'Home', href: 'index.html' },
  { label: 'Book Short Stay', href: 'stays.html' },
  {
    label: 'Our Businesses',
    href: 'businesses.html',
    children: [
      { label: 'Properties', href: 'properties.html' },
      { label: 'Technologies', href: 'technologies.html' },
      { label: 'Trading', href: 'trading.html' },
      { label: 'Ventures', href: 'ventures.html' },
      { label: 'Investments', href: 'investments.html' },
    ],
  },
];

const footerNavItems = [
  { label: 'Home', href: 'index.html' },
  { label: 'About Us', href: 'about.html' },
  { label: 'Our Businesses', href: 'businesses.html' },
  { label: 'Book Short Stay', href: 'stays.html' },
  { label: 'Investments', href: 'investments.html' },
  { label: 'CSR', href: 'csr.html' },
  { label: 'Insights', href: 'references.html' },
];

const founderLinks = {
  portfolio: 'founder.html',
  github: 'https://github.com/bbrain777',
  linkedin: 'https://www.linkedin.com/in/tayoobademi',
  techVideos: 'https://www.youtube.com/@TayoObademiTech',
  zion: 'https://www.zionyouths.org',
};

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
    image: partnersMeetingPhoto,
    description: 'Import/export, wholesale distribution, supply chain partnerships and global trade opportunities.',
  },
  {
    title: 'KAVARO Ventures',
    href: 'ventures.html',
    label: 'Ventures',
    image: partnersVenturesPhoto,
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

const contactOptions = [
  { label: 'Make an Enquiry', href: 'contact.html?type=General' },
  { label: 'Become a Partner', href: 'contact.html?type=Partnership' },
  { label: 'Booking Support', href: 'contact.html?type=Apartment%20Booking' },
  { label: 'Make a Complaint', href: 'contact.html?type=Complaint' },
  { label: 'Investment Enquiry', href: 'contact.html?type=Investment' },
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

async function readApiJson(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
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
  const [storageMode, setStorageMode] = useState('loading');
  const [storageMessage, setStorageMessage] = useState('Loading saved listings...');

  const saveBrowserApartments = (nextApartments) => {
    setCustomApartments(nextApartments);
    localStorage.setItem(apartmentStorageKey, JSON.stringify(nextApartments));
  };

  useEffect(() => {
    let active = true;

    fetch('/api/apartments')
      .then(readApiJson)
      .then((data) => {
        if (!active) return;
        setStorageMode(data.configured ? 'database' : 'browser');
        setStorageMessage(data.configured
          ? 'Listing management is ready.'
          : 'Listing changes are available in this browser session.');
        if (data.configured) {
          setCustomApartments(data.apartments || []);
          localStorage.setItem(apartmentStorageKey, JSON.stringify(data.apartments || []));
        }
      })
      .catch((error) => {
        if (!active) return;
        setStorageMode('browser');
        setStorageMessage(`${error.message} Changes will save only in this browser until the database is configured.`);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveCustomApartment = async (apartment) => {
    try {
      const data = await fetch('/api/admin-apartments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(apartment),
      }).then(readApiJson);

      saveBrowserApartments(data.apartments || []);
      setStorageMode('database');
      setStorageMessage('Listing saved successfully.');
      return { mode: 'database', apartments: data.apartments || [] };
    } catch (error) {
      const nextApartments = customApartments.some((item) => item.id === apartment.id)
        ? customApartments.map((item) => (item.id === apartment.id ? apartment : item))
        : [...customApartments, apartment];
      saveBrowserApartments(nextApartments);
      setStorageMode('browser');
      setStorageMessage('Listing saved for this browser session.');
      return { mode: 'browser', error: error.message, apartments: nextApartments };
    }
  };

  const deleteCustomApartment = async (apartmentId) => {
    try {
      const data = await fetch('/api/admin-apartments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: apartmentId }),
      }).then(readApiJson);

      saveBrowserApartments(data.apartments || []);
      setStorageMode('database');
      setStorageMessage('Listing removed successfully.');
      return { mode: 'database', apartments: data.apartments || [] };
    } catch (error) {
      const nextApartments = customApartments.filter((item) => item.id !== apartmentId);
      saveBrowserApartments(nextApartments);
      setStorageMode('browser');
      setStorageMessage('Listing removed from this browser session.');
      return { mode: 'browser', error: error.message, apartments: nextApartments };
    }
  };

  return {
    listings: useMemo(() => [...apartments, ...customApartments], [customApartments]),
    customApartments,
    saveCustomApartment,
    deleteCustomApartment,
    storageMode,
    storageMessage,
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
          <div className="header-contact-menu">
            <a className="btn btn-primary header-cta" href="contact.html">Get in Touch</a>
            <button className="contact-menu-toggle" type="button" aria-label="Open contact options" />
            <div className="contact-dropdown">
              {contactOptions.map((item) => (
                <a key={item.label} href={item.href}>{item.label}</a>
              ))}
            </div>
          </div>
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
            <a className="text-link" href="founder.html">View founder profile</a>
          </div>
        </article>
      </div>
    </section>
  );
}

function AuthorProfileCard({ compact = false }) {
  return (
    <article className={`author-profile ${compact ? 'author-profile-compact' : ''}`} itemScope itemType="https://schema.org/Person">
      <img src={founderProfilePhoto} alt="Tayo Obademi, software engineer, technology consultant and founder" itemProp="image" />
      <div>
        <span className="section-kicker">Founder Profile</span>
        <h3 itemProp="name">Tayo Obademi</h3>
        <p itemProp="alternateName">Also known as Olakunle Obademi</p>
        <p itemProp="jobTitle">Software Engineer | Technology Consultant | Founder & President, KAVARO Holdings Ltd | Founder, Zion Youth Development Initiative</p>
        <div className="profile-chip-row" aria-label="Founder expertise">
          {['Software Engineering', 'Technology Consultancy', 'Web Development', 'AI Automation', 'Business Strategy', 'Social Impact'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="profile-link-row">
          <a className="btn btn-primary" href={founderLinks.portfolio}>Founder Profile</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.zion} target="_blank" rel="noreferrer">Zion YDI</a>
        </div>
      </div>
    </article>
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

function FounderPage() {
  const expertise = [
    'Software engineering and modern web application development',
    'Technology consultancy for businesses, organisations and community projects',
    'AI automation, workflow improvement and practical digital transformation',
    'Corporate strategy across property, technology, trading, ventures and investment',
    'Founder-led social impact through Zion Youth Development Initiative',
    'Stakeholder communication, documentation, governance and service delivery',
  ];

  return (
    <>
      <PageHero
        kicker="Founder Profile"
        title="Tayo Obademi: software engineer, consultant and founder."
        text="Official profile for Tayo Obademi, also known as Olakunle Obademi, Founder & President of KAVARO Holdings Ltd and Founder of Zion Youth Development Initiative."
        actions={<><a className="btn btn-primary" href="contact.html">Contact Tayo</a><a className="btn btn-secondary" href={founderLinks.github} target="_blank" rel="noreferrer">View GitHub</a></>}
      />
      <section className="section founder-profile-section">
        <div className="container founder-profile-grid">
          <AuthorProfileCard />
          <div className="founder-bio-panel">
            <span className="section-kicker">Professional Biography</span>
            <h2>A technology-led founder building corporate and community platforms.</h2>
            <p>
              Tayo Obademi is a software engineer, technology consultant and founder focused on building practical digital systems, business platforms and long-term enterprise value. He leads KAVARO Holdings Ltd as Founder & President, bringing together property, technology, trading, ventures, investment and responsible community engagement under one corporate platform.
            </p>
            <p>
              Publicly, Tayo's professional brand is positioned around consultancy, software engineering, digital transformation and founder-led execution. His work connects technical delivery with business strategy, helping organisations present clearly online, structure services, prepare booking/payment workflows and build systems that can grow into larger operational platforms.
            </p>
            <p>
              Tayo is also the Founder of Zion Youth Development Initiative, a social-impact organisation focused on youth empowerment, education support, skills development, community development and humanitarian support. This creates a clear public connection between Tayo Obademi, KAVARO Holdings Ltd and Zion Youth Development Initiative.
            </p>
          </div>
        </div>
      </section>
      <section className="section intro-section">
        <div className="container service-grid">
          {expertise.map((item) => (
            <article className="service-card" key={item}>
              <h3>{item.split(' ').slice(0, 3).join(' ')}</h3>
              <p>{item}.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section investments">
        <div className="container profile-links founder-links-panel">
          <div className="copy-block">
            <span className="section-kicker">Online Search Identity</span>
            <h2>Tayo Obademi, Olakunle Obademi, KAVARO and Zion in one place.</h2>
            <p>
              This profile is structured to help search engines associate both public name variations with the same founder identity, KAVARO Holdings Ltd, Zion Youth Development Initiative, software engineering and technology consultancy.
            </p>
          </div>
          <a className="btn btn-primary" href={founderLinks.portfolio}>Portfolio</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.techVideos} target="_blank" rel="noreferrer">Tech Videos</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.zion} target="_blank" rel="noreferrer">Zion Youths</a>
        </div>
      </section>
      <section className="section contact">
        <div className="container contact-grid">
          <div className="copy-block">
            <span className="section-kicker">Contact Details</span>
            <h2>Professional enquiries.</h2>
            <div className="contact-details">
              <p><strong>Email</strong><a href="mailto:olakunleobademi@gmail.com">olakunleobademi@gmail.com</a></p>
              <p><strong>Phone</strong><a href="tel:+447307339657">+44 7307 339657</a></p>
              <p><strong>Website</strong><a href="https://www.kavaroholdings.com">www.kavaroholdings.com</a></p>
              <p><strong>Address</strong>40 Stainsby Street, Thornaby, TS17 6HP</p>
            </div>
          </div>
          <div className="investment-panel">
            <h3>LinkedIn positioning preview</h3>
            <p><strong>Headline:</strong> Software Engineer | Technology Consultant | Founder & President, KAVARO Holdings Ltd | Founder, Zion Youth Development Initiative</p>
            <p><strong>Public perception:</strong> consultant, builder and founder serving clients, partners and community-impact projects.</p>
            <p><strong>Search terms:</strong> Tayo Obademi, Olakunle Obademi, KAVARO Holdings Ltd, Zion Youth Development Initiative, software engineer, technology consultant.</p>
            <p><strong>Proof links:</strong> LinkedIn profile, GitHub portfolio and Tayo Obademi Tech video channel.</p>
          </div>
        </div>
      </section>
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
            <p>Tayo Obademi's founder profile is the public portfolio hub for software engineering, technology consultancy, KAVARO Holdings Ltd and Zion Youth Development Initiative.</p>
          </div>
          <a className="btn btn-primary" href={founderLinks.portfolio}>Portfolio</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn btn-secondary tech-link" href={founderLinks.techVideos} target="_blank" rel="noreferrer">Tech Videos</a>
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
        image={partnersMeetingPhoto}
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
        image={partnersVenturesPhoto}
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
          <p>Explore short-stay, long-stay and serviced accommodation options prepared for KAVARO guests.</p>
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
  const {
    listings,
    customApartments,
    saveCustomApartment,
    deleteCustomApartment,
    storageMode,
    storageMessage,
  } = useApartmentListings();
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
        text="Browse available apartments, serviced accommodation and rental properties with secure booking preparation."
        image="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="section intro-section">
        <div className="container">
          <ApartmentFilters filters={filters} setFilters={setFilters} />
          <AdminGate>
            {(session) => (
              <>
                {session.role === 'admin' && <UserManager />}
                {['admin', 'staff'].includes(session.role) ? (
                  <ApartmentManager
                    session={session}
                    customApartments={customApartments}
                    saveCustomApartment={saveCustomApartment}
                    deleteCustomApartment={deleteCustomApartment}
                    storageMode={storageMode}
                    storageMessage={storageMessage}
                  />
                ) : null}
                {['partner', 'partner_pending'].includes(session.role) && <PartnerAccessPanel session={session} />}
              </>
            )}
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

function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;

    let cancelled = false;
    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const response = await fetch('/api/google-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential }),
            });
            const data = await readApiJson(response);
            onSuccess(data);
          } catch (error) {
            onError(error.message || 'Google sign-in failed.');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 400,
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => onError('Google sign-in could not be loaded.');
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId, onError, onSuccess]);

  if (!clientId) return null;

  return <div className="google-signin-slot" ref={buttonRef} />;
}

function AdminGate({ children }) {
  const [session, setSession] = useState({ loading: true, authenticated: false, email: '', role: '' });
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [reset, setReset] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });
  const [authMode, setAuthMode] = useState('login');
  const [showResetOption, setShowResetOption] = useState(false);
  const [emailAccessOpen, setEmailAccessOpen] = useState(false);
  const [status, setStatus] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const readApiResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Secure account services are temporarily unavailable. Please try again later.');
    }
  };

  useEffect(() => {
    fetch('/api/admin-session')
      .then(readApiResponse)
      .then((data) => setSession({
        loading: false,
        authenticated: Boolean(data.authenticated),
        email: data.email || '',
        fullName: data.fullName || '',
        role: data.role || '',
        id: data.id || '',
      }))
      .catch(() => setSession({ loading: false, authenticated: false, email: '', role: '' }));
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const updateSignup = (event) => {
    const { name, value } = event.target;
    setSignup((current) => ({ ...current, [name]: value }));
  };

  const updateReset = (event) => {
    const { name, value } = event.target;
    setReset((current) => ({ ...current, [name]: value }));
  };

  const login = async (event) => {
    event.preventDefault();
    setShowResetOption(false);
    setStatus('Signing you in...');

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await readApiResponse(response);

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error || 'Sign-in failed.');
      }

      setSession({
        loading: false,
        authenticated: true,
        email: data.email,
        fullName: data.fullName || '',
        role: data.role || '',
      });
      setCredentials({ email: '', password: '' });
      setStatus('');
    } catch (error) {
      setReset((current) => ({ ...current, email: credentials.email }));
      setEmailAccessOpen(true);
      if (String(error.message || '').toLowerCase().includes('account services')) {
        setShowResetOption(false);
        setStatus('Secure account services are not available in this preview. Please open the Vercel Dev or deployed site to sign in.');
      } else {
        setShowResetOption(true);
        setStatus('We could not sign you in with those details. Please check your email and password.');
      }
    }
  };

  const handleGoogleSuccess = useCallback((data) => {
    setSession({
      loading: false,
      authenticated: true,
      email: data.email,
      fullName: data.fullName || '',
      role: data.role || '',
      id: data.id || '',
    });
    setStatus('');
  }, []);

  const createAccount = async (event) => {
    event.preventDefault();
    setStatus('Creating account...');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signup, action: 'signup' }),
      });
      const data = await readApiResponse(response);

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error || 'Unable to create account.');
      }

      setSession({
        loading: false,
        authenticated: true,
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role,
        id: data.user.id,
      });
      setSignup({ fullName: '', email: '', phone: '', password: '' });
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setStatus('Requesting OTP...');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reset.email, action: 'request-otp' }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to request OTP.');
      setStatus(data.message || 'If your email is registered, a password reset code has been sent.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setStatus('Resetting password...');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reset, action: 'reset-password' }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to reset password.');
      setReset({ email: '', code: '', newPassword: '', confirmPassword: '' });
      setAuthMode('login');
      setShowResetOption(false);
      setStatus(data.message);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const logout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => undefined);
    setSession({ loading: false, authenticated: false, email: '', role: '' });
    setStatus('');
  };

  if (session.loading) {
    return (
      <section className="admin-panel">
        <p className="form-status">Checking account session...</p>
      </section>
    );
  }

  if (!session.authenticated) {
    return (
      <section className="admin-panel account-access-panel" aria-label="Account access">
        <div className="section-header align-left">
          <span className="account-access-icon" aria-hidden="true" />
          <span className="section-kicker">Account Access</span>
          <h2>Sign in to your KAVARO Short Stay bookings.</h2>
          <p>Access your booking details, saved enquiries and short-stay account securely.</p>
        </div>
        {googleClientId ? (
          <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={setStatus} />
        ) : (
          <button className="btn btn-primary auth-primary-bar" type="button" onClick={() => setEmailAccessOpen((current) => !current)}>
            Sign In
          </button>
        )}
        {!googleClientId && emailAccessOpen && (
          <div className="manager-actions">
            <button className={`btn ${authMode === 'login' ? 'btn-primary' : 'btn-secondary tech-link'}`} type="button" onClick={() => setAuthMode('login')}>Sign In</button>
            <button className={`btn ${authMode === 'signup' ? 'btn-primary' : 'btn-secondary tech-link'}`} type="button" onClick={() => setAuthMode('signup')}>Create Account</button>
            {(showResetOption || authMode === 'reset') && (
              <button className={`btn ${authMode === 'reset' ? 'btn-primary' : 'btn-secondary tech-link'}`} type="button" onClick={() => setAuthMode('reset')}>Reset Password</button>
            )}
          </div>
        )}
        {emailAccessOpen && authMode === 'login' && (
          <form className="manager-form" onSubmit={login} noValidate>
            <div className="form-row">
              <label>Email<input name="email" type="email" value={credentials.email} onChange={update} required /></label>
              <label>Password<input name="password" type="password" value={credentials.password} onChange={update} required /></label>
            </div>
            <button className="btn btn-primary" type="submit">Sign In</button>
            {showResetOption && (
              <p className="account-recovery-note">
                Having trouble signing in? You can reset your password after confirming your email.
              </p>
            )}
          </form>
        )}
        {emailAccessOpen && authMode === 'signup' && (
          <form className="manager-form" onSubmit={createAccount} noValidate>
            <div className="form-row">
              <label>Full name<input name="fullName" value={signup.fullName} onChange={updateSignup} required /></label>
              <label>Email<input name="email" type="email" value={signup.email} onChange={updateSignup} required /></label>
            </div>
            <div className="form-row">
              <label>Phone<input name="phone" value={signup.phone} onChange={updateSignup} /></label>
              <label>Password<input name="password" type="password" minLength="8" value={signup.password} onChange={updateSignup} required /></label>
            </div>
            <button className="btn btn-primary" type="submit">Create User Account</button>
          </form>
        )}
        {emailAccessOpen && authMode === 'reset' && (
          <form className="manager-form" onSubmit={resetPassword} noValidate>
            <div className="form-row">
              <label>Email<input name="email" type="email" value={reset.email} onChange={updateReset} required /></label>
              <label>OTP code<input name="code" value={reset.code} onChange={updateReset} inputMode="numeric" /></label>
            </div>
            <div className="form-row">
              <label>New password<input name="newPassword" type="password" minLength="8" value={reset.newPassword} onChange={updateReset} required /></label>
              <label>Confirm password<input name="confirmPassword" type="password" minLength="8" value={reset.confirmPassword} onChange={updateReset} required /></label>
            </div>
            <div className="manager-actions">
              <button className="btn btn-secondary tech-link" type="button" onClick={requestOtp}>Send OTP</button>
              <button className="btn btn-primary" type="submit">Reset Password</button>
            </div>
          </form>
        )}
        {status && <p className="form-status">{status}</p>}
      </section>
    );
  }

  return (
    <>
      <section className="admin-session-bar">
        <span>Signed in as {session.email} ({session.role})</span>
        <button type="button" onClick={logout}>Sign Out</button>
      </section>
      {typeof children === 'function' ? children(session) : children}
    </>
  );
}

function AccountSecurity({ session }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState('');

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('Changing password...');

    try {
      const data = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...form, action: 'change-password' }),
      }).then(readApiJson);

      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus(data.message || 'Password changed.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="admin-panel">
      <div className="section-header align-left">
        <span className="section-kicker">Account Security</span>
        <h2>{session.fullName || session.email}</h2>
        <p><strong>Role:</strong> {session.role}</p>
      </div>
      <form className="manager-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Current password<input name="currentPassword" type="password" value={form.currentPassword} onChange={update} required /></label>
          <label>New password<input name="newPassword" type="password" minLength="8" value={form.newPassword} onChange={update} required /></label>
        </div>
        <label>Confirm new password<input name="confirmPassword" type="password" minLength="8" value={form.confirmPassword} onChange={update} required /></label>
        <button className="btn btn-primary" type="submit">Change Password</button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}

function PartnerAccessPanel({ session }) {
  const [status, setStatus] = useState('');
  const [role, setRole] = useState(session.role);

  const requestPartnerAccess = async () => {
    setStatus('Submitting your partner request...');

    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'request-partner' }),
      });
      const data = await readApiJson(response);
      setRole(data.user?.role || role);
      setStatus(data.message || 'Your partner request has been sent for admin approval.');
    } catch (error) {
      setStatus(error.message || 'Unable to submit partner request.');
    }
  };

  const content = {
    partner: {
      kicker: 'Partner Access',
      title: 'Your KAVARO partner access is active.',
      text: 'Partner tools and opportunities will appear here as they are released.',
      action: null,
    },
    partner_pending: {
      kicker: 'Partner Request',
      title: 'Your partner request is awaiting approval.',
      text: 'The KAVARO admin team will review your request before partner privileges are activated.',
      action: null,
    },
  }[role] || {
    kicker: 'My Account',
    title: 'Your KAVARO account is active.',
    text: 'You can request partner access for KAVARO opportunities. Approval is required before partner privileges are enabled.',
    action: <button className="btn btn-primary" type="button" onClick={requestPartnerAccess}>Request Partner Access</button>,
  };

  return (
    <section className="admin-panel">
      <div className="section-header align-left">
        <span className="section-kicker">{content.kicker}</span>
        <h2>{content.title}</h2>
        <p>{content.text}</p>
      </div>
      {content.action}
      {status && <p className="form-status">{status}</p>}
    </section>
  );
}

function UserManager() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'user', password: '' });
  const [status, setStatus] = useState('Loading users...');

  const loadUsers = () => {
    fetch('/api/admin-users', { credentials: 'same-origin' })
      .then(readApiJson)
      .then((data) => {
        setUsers(data.users || []);
        setStatus('');
      })
      .catch((error) => setStatus(error.message));
  };

  useEffect(loadUsers, []);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('Saving user...');

    try {
      const data = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(form),
      }).then(readApiJson);

      setUsers(data.users || []);
      setForm({ fullName: '', email: '', phone: '', role: 'user', password: '' });
      setStatus('User saved. If you set a temporary password, ask them to change it after signing in.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const changeRole = async (user, role) => {
    setStatus(`Updating ${user.email}...`);

    try {
      const data = await fetch('/api/admin-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: user.id, role }),
      }).then(readApiJson);

      setUsers(data.users || []);
      setStatus('Role updated.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="apartment-manager" aria-label="User manager">
      <div className="section-header align-left">
        <span className="section-kicker">User & Staff Manager</span>
        <h2>Assign account roles.</h2>
        <p>Admins can create users, promote staff, and keep full access across all accounts and rentals.</p>
      </div>
      <form className="manager-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Full name<input name="fullName" value={form.fullName} onChange={update} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
        </div>
        <div className="form-row">
          <label>Phone<input name="phone" value={form.phone} onChange={update} /></label>
          <label>Role<select name="role" value={form.role} onChange={update}>
            <option value="user">User</option>
            <option value="partner_pending">Partner Pending</option>
            <option value="partner">Partner</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select></label>
        </div>
        <label>Temporary password<input name="password" type="password" minLength="8" value={form.password} onChange={update} placeholder="Optional for existing users" /></label>
        <button className="btn btn-primary" type="submit">Save User</button>
        {status && <p className="form-status">{status}</p>}
      </form>
      {users.length > 0 && (
        <div className="managed-list">
          {users.map((user) => (
            <article key={user.id}>
              <div>
                <strong>{user.fullName}</strong>
                <span>{user.email} - {user.role}</span>
              </div>
              <select value={user.role} onChange={(event) => changeRole(user, event.target.value)}>
                <option value="user">User</option>
                <option value="partner_pending">Partner Pending</option>
                <option value="partner">Partner</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ApartmentManager({ session, customApartments, saveCustomApartment, deleteCustomApartment, storageMode, storageMessage }) {
  const [form, setForm] = useState(emptyApartmentForm);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setStatus('Uploading apartment photo...');

    try {
      const imageData = await Promise.all(files.map(async (file) => {
        try {
          const data = await fetch('/api/admin-upload', {
            method: 'POST',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'X-File-Name': file.name,
            },
            credentials: 'same-origin',
            body: file,
          }).then(readApiJson);

          return data.url;
        } catch {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      }));

      setForm((current) => ({ ...current, images: [...current.images, ...imageData] }));
      setStatus(imageData.some((image) => String(image).startsWith('data:'))
        ? 'Photo added to this listing.'
        : 'Photo uploaded successfully.');
      event.target.value = '';
    } catch (error) {
      setStatus(error.message || 'Unable to upload photo.');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('');

    if (!form.apartmentName || !form.location || !form.pricePerNight || !form.shortDescription) {
      setStatus('Please complete apartment name, location, nightly price and short description.');
      return;
    }

    setSaving(true);
    const apartment = normalizeApartment(form);

    try {
      const result = await saveCustomApartment(apartment);
      setForm(emptyApartmentForm);
      setStatus(result.mode === 'database'
        ? `${apartment.apartmentName} has been saved to the database.`
        : `${apartment.apartmentName} has been saved only in this browser. ${result.error || ''}`);
    } finally {
      setSaving(false);
    }
  };

  const editApartment = (apartment) => {
    setForm(apartmentToForm(apartment));
    setStatus(`Editing ${apartment.apartmentName}.`);
  };

  const deleteApartment = async (apartmentId) => {
    setSaving(true);
    const result = await deleteCustomApartment(apartmentId);
    if (form.id === apartmentId) setForm(emptyApartmentForm);
    setStatus(result.mode === 'database'
      ? 'Apartment removed from the database.'
      : `Apartment removed only from this browser. ${result.error || ''}`);
    setSaving(false);
  };

  const removeImage = (image) => {
    setForm((current) => ({ ...current, images: current.images.filter((item) => item !== image) }));
  };

  return (
    <section className="apartment-manager" aria-label="Apartment manager">
      <div className="section-header align-left">
        <span className="section-kicker">Apartment Manager</span>
        <h2>Create or edit guest-ready listings.</h2>
        <p>{storageMessage}</p>
        {storageMode === 'browser' && <p>Some listing changes may be limited to this browser session.</p>}
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
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : (form.id ? 'Update Apartment' : 'Create Apartment')}</button>
          <button className="btn btn-secondary tech-link" type="button" onClick={() => setForm(emptyApartmentForm)} disabled={saving}>Clear Form</button>
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
              <button type="button" onClick={() => editApartment(apartment)} disabled={saving}>Edit</button>
              <button type="button" onClick={() => deleteApartment(apartment.id)} disabled={saving}>Delete</button>
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

    const summary = {
      apartment: {
        id: apartment.id,
        apartmentName: apartment.apartmentName,
        pricePerNight: apartment.pricePerNight,
        cleaningFee: apartment.cleaningFee,
        securityDeposit: apartment.securityDeposit,
      },
      guest: form,
      nights,
      total,
    };

    try {
      localStorage.setItem('kavaroBookingSummary', JSON.stringify(summary));
      window.location.href = 'payment.html';
    } catch {
      setError('Unable to prepare payment summary. Please remove oversized uploaded images from this listing or try again in a fresh browser tab.');
    }
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
    try {
      const saved = localStorage.getItem('kavaroBookingSummary');
      if (saved) setSummary(JSON.parse(saved));
    } catch {
      setPaymentStatus('The saved booking summary could not be loaded. Please start again from the booking page.');
    }
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

const legalPages = {
  terms: {
    kicker: 'Terms & Conditions',
    title: 'Website, enquiry and booking terms.',
    intro: 'These terms explain how visitors, customers, partners and account users may use the KAVARO Holdings Ltd website and related online services.',
    updated: 'Last updated: 8 June 2026',
    sections: [
      {
        title: '1. About KAVARO Holdings Ltd',
        body: [
          'This website is operated for KAVARO Holdings Ltd, a corporate group presenting activities across property, technology, trading, ventures, investment, partnerships and social impact.',
          'References to KAVARO, we, us or our mean KAVARO Holdings Ltd and any relevant business activity, subsidiary, trading style, project or authorised representative connected with the website.',
        ],
      },
      {
        title: '2. Use of this website',
        body: [
          'You may use this website for lawful personal, business, enquiry, booking and informational purposes. You must not misuse the site, attempt unauthorised access, interfere with security features, submit false information, or use the site in a way that could damage KAVARO or any third party.',
          'We may update, suspend or withdraw parts of the website at any time for operational, security, legal or business reasons.',
        ],
      },
      {
        title: '3. Enquiries and business information',
        body: [
          'Information on this website is provided for general corporate and informational purposes. It does not create a binding offer, partnership, investment contract, agency relationship or professional advisory relationship unless confirmed in a separate written agreement.',
          'Any investment, partnership, trading, acquisition or business opportunity shown on the website is subject to review, due diligence, eligibility checks, formal documentation and approval by KAVARO.',
        ],
      },
      {
        title: '4. Short-stay and accommodation bookings',
        body: [
          'Apartment and short-stay listings are provided to help customers prepare an enquiry or booking request. Availability, pricing, cleaning fees, deposits, guest limits and property rules may be subject to confirmation before a booking is accepted.',
          'A booking is not final until KAVARO or the relevant accommodation operator confirms it and any required payment, deposit, identification or pre-arrival checks have been completed.',
          'Guests are responsible for providing accurate information, complying with house rules, respecting the property, and ensuring that their stay is lawful and appropriate for the number of guests declared.',
        ],
      },
      {
        title: '5. Payments, cancellations and refunds',
        body: [
          'Where payments are made online, card processing may be handled by Stripe or another secure payment provider. KAVARO does not store full card numbers on this website.',
          'Cancellation, refund, security deposit and damage policies may vary by property, booking type and confirmed agreement. Any refund or deduction may depend on timing, property condition, third-party charges and the terms confirmed at booking.',
        ],
      },
      {
        title: '6. Accounts and access',
        body: [
          'If account access, Google sign-in, partner access or admin/staff tools are available, users are responsible for keeping login access secure and for all activity carried out through their account.',
          'KAVARO may restrict, suspend or remove account access where needed for security, misuse, inaccurate information, operational reasons or legal compliance.',
        ],
      },
      {
        title: '7. Intellectual property',
        body: [
          'The KAVARO name, website design, text, images, logos, business descriptions, page structure and other content are owned by or licensed to KAVARO unless stated otherwise.',
          'You may view and share website links for normal use, but you must not copy, reproduce, scrape, sell, alter or commercially exploit website content without written permission.',
        ],
      },
      {
        title: '8. Liability',
        body: [
          'We aim to keep the website accurate and available, but we do not guarantee that all content will always be complete, current, uninterrupted or error-free.',
          'To the fullest extent permitted by law, KAVARO is not responsible for indirect losses, loss of profit, loss of opportunity, business interruption, data loss, third-party service issues, or decisions made solely from website information.',
        ],
      },
      {
        title: '9. Governing law',
        body: [
          'These terms are governed by the laws of England and Wales. Any dispute connected with the website or these terms should be handled through the courts of England and Wales unless a mandatory legal rule says otherwise.',
        ],
      },
      {
        title: '10. Contact',
        body: [
          'Questions about these terms can be sent to info@kavaro-holdings.com or through the contact page.',
        ],
      },
    ],
  },
  privacy: {
    kicker: 'Privacy Policy',
    title: 'How KAVARO handles personal information.',
    intro: 'This policy explains what personal data may be collected through the website, why it is used, and how visitors and customers can contact KAVARO about privacy matters.',
    updated: 'Last updated: 8 June 2026',
    sections: [
      {
        title: '1. Personal data we may collect',
        body: [
          'We may collect information you provide through contact forms, booking forms, account access, partner requests, complaint forms or direct communication. This may include your name, email address, phone number, company, country, enquiry type, booking details, payment status, messages and account role.',
          'If you use Google sign-in, we may receive basic profile information needed to identify and authenticate your account, such as your email address and display name.',
        ],
      },
      {
        title: '2. How we use personal data',
        body: [
          'We use personal data to respond to enquiries, manage booking requests, process payments, provide account access, review partner or investment enquiries, handle complaints, protect the website, keep business records and comply with legal obligations.',
          'We may also use aggregated or non-identifying information to improve website performance, service quality and business planning.',
        ],
      },
      {
        title: '3. Legal bases for processing',
        body: [
          'Depending on the context, we process personal data because it is necessary to respond before entering into a contract, perform a contract, comply with legal duties, pursue legitimate business interests, protect security, or because you have given consent.',
        ],
      },
      {
        title: '4. Sharing information',
        body: [
          'We may share relevant information with service providers such as hosting providers, database providers, payment processors, email providers, Google sign-in services, professional advisers, legal authorities or operational partners where needed to provide the website and related services.',
          'We do not sell personal data.',
        ],
      },
      {
        title: '5. Payments',
        body: [
          'Online card payments may be processed by Stripe. Payment card details are entered through the payment provider and are subject to that provider\'s own privacy and security practices. KAVARO does not store full card numbers through this website.',
        ],
      },
      {
        title: '6. Data retention',
        body: [
          'We keep personal data only for as long as reasonably needed for the purpose collected, including enquiry handling, booking administration, legal compliance, dispute handling, security, accounting and business record requirements.',
        ],
      },
      {
        title: '7. Your rights',
        body: [
          'Subject to applicable law, you may have rights to request access, correction, deletion, restriction, objection, portability or withdrawal of consent. You may also raise concerns with the UK Information Commissioner\'s Office.',
          'To make a privacy request, contact info@kavaro-holdings.com and include enough information for us to identify the relevant record.',
        ],
      },
      {
        title: '8. Security',
        body: [
          'We use reasonable technical and organisational measures to protect personal information, but no website or online service can guarantee absolute security.',
        ],
      },
      {
        title: '9. International services',
        body: [
          'Some website tools or service providers may process information outside the United Kingdom. Where this happens, appropriate safeguards should be used where required by data protection law.',
        ],
      },
      {
        title: '10. Contact',
        body: [
          'Privacy questions can be sent to info@kavaro-holdings.com or through the contact page.',
        ],
      },
    ],
  },
  cookies: {
    kicker: 'Cookie Policy',
    title: 'Cookies and similar technologies.',
    intro: 'This policy explains how the KAVARO website may use cookies, local storage and third-party technologies to operate and improve the website.',
    updated: 'Last updated: 8 June 2026',
    sections: [
      {
        title: '1. What cookies are',
        body: [
          'Cookies are small files placed on your device by a website. Similar technologies, such as local storage, can also store settings or session information in your browser.',
        ],
      },
      {
        title: '2. Essential technologies',
        body: [
          'We may use essential cookies or browser storage to support website security, account sessions, booking flow state, theme preferences, form functionality and short-stay listing management.',
          'These technologies are needed for parts of the website to work correctly and cannot always be disabled through the website itself.',
        ],
      },
      {
        title: '3. Third-party services',
        body: [
          'Where enabled, third-party services such as Google sign-in, Stripe payment processing, hosting, analytics or embedded content may set cookies or use similar technologies under their own policies.',
          'KAVARO does not control every cookie set by third-party services, but we aim to use reputable providers for website operations and customer workflows.',
        ],
      },
      {
        title: '4. Analytics and improvement',
        body: [
          'If analytics are added in the future, they may help us understand website traffic, page performance and service interest. Where legally required, consent controls should be provided before non-essential analytics cookies are used.',
        ],
      },
      {
        title: '5. Managing cookies',
        body: [
          'You can usually block, delete or manage cookies through your browser settings. Blocking cookies may affect account access, booking flows, payment redirection, saved preferences or other website features.',
        ],
      },
      {
        title: '6. Updates',
        body: [
          'This cookie policy may be updated when website features, third-party services or legal requirements change.',
        ],
      },
      {
        title: '7. Contact',
        body: [
          'Questions about cookies can be sent to info@kavaro-holdings.com or through the contact page.',
        ],
      },
    ],
  },
};

function LegalPage({ type }) {
  const page = legalPages[type];

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} text={page.intro} />
      <section className="section legal-page-section">
        <div className="container legal-page-grid">
          <aside className="legal-summary-panel">
            <span className="section-kicker">Legal Resources</span>
            <h2>KAVARO Holdings Ltd</h2>
            <p>{page.updated}</p>
            <div className="legal-link-list">
              <a href="terms.html">Terms & Conditions</a>
              <a href="privacy.html">Privacy Policy</a>
              <a href="cookies.html">Cookie Policy</a>
            </div>
          </aside>
          <div className="legal-document">
            <p className="legal-disclaimer">
              This page is provided for transparency and general website governance. It should be reviewed periodically and may be updated as KAVARO services, suppliers and legal requirements develop.
            </p>
            {page.sections.map((section) => (
              <article key={section.title}>
                <h3>{section.title}</h3>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </article>
            ))}
          </div>
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
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get('type') || '';
  const [formStatus, setFormStatus] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      setFormStatus('Please complete the required enquiry details.');
      return;
    }
    const enquiryType = new FormData(event.currentTarget).get('type');
    setFormStatus(enquiryType === 'Partnership'
      ? 'Thank you. Your partnership enquiry has been prepared for the KAVARO team. Partner privileges require admin approval after account review.'
      : 'Thank you. Your enquiry has been prepared for the KAVARO team.');
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
              <label>Enquiry Type<select name="type" required defaultValue={requestedType}><option value="" disabled>Select enquiry</option><option>Investment</option><option>Partnership</option><option>Complaint</option><option>Property</option><option>Technology</option><option>Trading</option><option>Apartment Booking</option><option>General</option></select></label>
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
          {footerNavItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          <a href="founder.html">Founder</a>
          <a href="terms.html">Terms</a>
          <a href="privacy.html">Privacy</a>
          <a href="cookies.html">Cookies</a>
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
    'founder.html': <FounderPage />,
    'references.html': <ReferencesPage />,
    'contact.html': <ContactPage />,
    'terms.html': <LegalPage type="terms" />,
    'privacy.html': <LegalPage type="privacy" />,
    'cookies.html': <LegalPage type="cookies" />,
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
