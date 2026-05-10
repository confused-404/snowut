import { useEffect, useMemo, useState } from "react";
import { audiences, categories, regions, resources } from "./data/resources";
import { events } from "./data/events";

const navItems = [
  ["Home", "home"],
  ["Directory", "directory"],
  ["Spotlights", "spotlights"],
  ["Events", "events"],
  ["Map", "map"],
  ["Submit", "submit"],
  ["About", "about"],
];

const impactStats = [
  ["15", "curated resources"],
  ["7", "Utah regions"],
  ["10", "audience groups"],
  ["24/7", "safety access"],
];

const guideCards = [
  {
    title: "Before You Leave",
    text: "Check weather, road conditions, avalanche forecasts, pass status, and transportation options before driving into a canyon.",
  },
  {
    title: "At the Mountain",
    text: "Keep emergency contacts close, hydrate, respect closures, and match terrain choices to skill, equipment, and conditions.",
  },
  {
    title: "After the Day",
    text: "Report observations, support local nonprofits, consider transit next time, and share resources with newer community members.",
  },
];

const matchOptions = [
  { label: "Safety education", categories: ["Safety", "Avalanche Education"] },
  { label: "Adaptive sport", categories: ["Accessibility/Adaptive Sports"] },
  { label: "Climate action", categories: ["Environmental/Climate"] },
  { label: "Youth access", categories: ["Kids and Youth Programs"] },
  { label: "Community aid", categories: ["Community Support", "Financial Assistance"] },
];

function App() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All regions");
  const [selectedAudience, setSelectedAudience] = useState("All audiences");
  const [expandedResource, setExpandedResource] = useState(resources[0].id);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [activeRegion, setActiveRegion] = useState("Statewide");
  const [eventCategory, setEventCategory] = useState("All categories");
  const [matchChoice, setMatchChoice] = useState(matchOptions[0].label);
  const [submissionStatus, setSubmissionStatus] = useState("");

  const featuredResources = useMemo(
    () => resources.filter((resource) => resource.featured),
    [],
  );

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchable = [
        resource.name,
        resource.description,
        resource.details,
        resource.region,
        resource.categories.join(" "),
        resource.audience.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          resource.categories.includes(category),
        );
      const matchesRegion =
        selectedRegion === "All regions" || resource.region === selectedRegion;
      const matchesAudience =
        selectedAudience === "All audiences" ||
        resource.audience.includes(selectedAudience);

      return (
        matchesQuery &&
        matchesCategories &&
        matchesRegion &&
        matchesAudience
      );
    });
  }, [query, selectedCategories, selectedRegion, selectedAudience]);

  const visibleEvents = useMemo(() => {
    if (eventCategory === "All categories") {
      return events;
    }

    return events.filter((event) => event.category === eventCategory);
  }, [eventCategory]);

  const activeRegionResources = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource.region === activeRegion ||
          (activeRegion !== "Online / National" && resource.region === "Statewide"),
      ),
    [activeRegion],
  );

  const matchedResources = useMemo(() => {
    const selected = matchOptions.find((option) => option.label === matchChoice);
    return resources
      .filter((resource) =>
        resource.categories.some((category) =>
          selected.categories.includes(category),
        ),
      )
      .slice(0, 3);
  }, [matchChoice]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSpotlightIndex((current) => (current + 1) % featuredResources.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [featuredResources.length]);

  function toggleCategory(category) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategories([]);
    setSelectedRegion("All regions");
    setSelectedAudience("All audiences");
  }

  function moveSpotlight(direction) {
    setSpotlightIndex(
      (current) =>
        (current + direction + featuredResources.length) %
        featuredResources.length,
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setSubmissionStatus("Please complete the required fields before submitting.");
      return;
    }

    form.reset();
    setSubmissionStatus(
      "Thank you. Your resource was received for community review.",
    );
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Directory
          query={query}
          setQuery={setQuery}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedAudience={selectedAudience}
          setSelectedAudience={setSelectedAudience}
          filteredResources={filteredResources}
          expandedResource={expandedResource}
          setExpandedResource={setExpandedResource}
          clearFilters={clearFilters}
        />
        <Spotlights
          resources={featuredResources}
          activeIndex={spotlightIndex}
          moveSpotlight={moveSpotlight}
          setSpotlightIndex={setSpotlightIndex}
        />
        <Events
          eventCategory={eventCategory}
          setEventCategory={setEventCategory}
          visibleEvents={visibleEvents}
        />
        <MapSection
          activeRegion={activeRegion}
          setActiveRegion={setActiveRegion}
          activeRegionResources={activeRegionResources}
        />
        <GuidesAndMatching
          matchChoice={matchChoice}
          setMatchChoice={setMatchChoice}
          matchedResources={matchedResources}
        />
        <SubmitResource
          handleSubmit={handleSubmit}
          submissionStatus={submissionStatus}
        />
        <About />
      </main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="SnowUT home">
        <span className="brand-mark" aria-hidden="true">
          S
        </span>
        <span>
          <strong>SnowUT</strong>
        </span>
      </a>
      <nav className="nav" aria-label="Primary navigation">
        {navItems.map(([label, id]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="hero section-anchor">
      <div className="hero-art" aria-hidden="true">
        <div className="sun" />
        <div className="trail-sign sign-one">SAFETY</div>
        <div className="trail-sign sign-two">ACCESS</div>
        <div className="trail-sign sign-three">CLIMATE</div>
        <div className="ridge ridge-back" />
        <div className="ridge ridge-mid" />
        <div className="ridge ridge-front" />
        <div className="trail trail-one" />
        <div className="trail trail-two" />
      </div>
      <div className="hero-content">
        <p className="eyebrow">SnowUT</p>
        <h1>Find the right mountain resource before the day depends on it.</h1>
        <p>
          Search safety tools, adaptive programs, youth access, climate action,
          community support, events, and volunteer opportunities in one focused
          hub.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#directory">
            Search resources
          </a>
          <a className="button secondary" href="#submit">
            Add a resource
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats-band" aria-label="Hub statistics">
      {impactStats.map(([value, label]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

function Directory(props) {
  const {
    query,
    setQuery,
    selectedCategories,
    toggleCategory,
    selectedRegion,
    setSelectedRegion,
    selectedAudience,
    setSelectedAudience,
    filteredResources,
    expandedResource,
    setExpandedResource,
    clearFilters,
  } = props;

  return (
    <section id="directory" className="section section-anchor">
      <SectionHeading
        eyebrow="Resource directory"
        title="Search by need, place, or who the resource serves."
        text="Filters combine together, so users can quickly narrow statewide resources into a practical shortlist."
      />
      <div className="directory-layout">
        <aside className="filters" aria-label="Resource filters">
          <label className="field">
            <span>Keyword search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Try avalanche, youth, adaptive..."
            />
          </label>

          <label className="field">
            <span>Location</span>
            <select
              value={selectedRegion}
              onChange={(event) => setSelectedRegion(event.target.value)}
            >
              <option>All regions</option>
              {regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Who it serves</span>
            <select
              value={selectedAudience}
              onChange={(event) => setSelectedAudience(event.target.value)}
            >
              <option>All audiences</option>
              {audiences.map((audience) => (
                <option key={audience}>{audience}</option>
              ))}
            </select>
          </label>

          <div className="filter-group">
            <span className="filter-label">Categories</span>
            <div className="chip-grid">
              {categories.map((category) => (
                <button
                  className={`chip ${
                    selectedCategories.includes(category) ? "is-active" : ""
                  }`}
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-pressed={selectedCategories.includes(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <button className="button ghost" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </aside>

        <div className="results">
          <div className="results-topline">
            <strong>{filteredResources.length} resources found</strong>
            <span>Click a card for details, contact info, and impact.</span>
          </div>
          <div className="resource-grid">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                expanded={expandedResource === resource.id}
                onToggle={() =>
                  setExpandedResource((current) =>
                    current === resource.id ? "" : resource.id,
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourceCard({ resource, expanded, onToggle }) {
  return (
    <article className="resource-card" style={{ "--accent": resource.accent }}>
      <button
        className="card-button"
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span
          className="resource-logo"
          style={{ "--accent": resource.accent }}
          aria-hidden="true"
        >
          {resource.shortName}
        </span>
        <span className="resource-summary">
          <span className="card-kicker">{resource.region}</span>
          <strong>{resource.name}</strong>
          <span>{resource.description}</span>
        </span>
        <span className="expand-indicator" aria-hidden="true">
          {expanded ? "-" : "+"}
        </span>
      </button>
      <div className="tag-row">
        {resource.categories.slice(0, 3).map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>
      {expanded && (
        <div className="card-details">
          <p>{resource.details}</p>
          <dl>
            <div>
              <dt>Serves</dt>
              <dd>{resource.audience.join(", ")}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{resource.phone}</dd>
            </div>
            <div>
              <dt>Impact</dt>
              <dd>{resource.impact}</dd>
            </div>
          </dl>
          <a href={resource.website} target="_blank" rel="noreferrer">
            Visit resource
          </a>
        </div>
      )}
    </article>
  );
}

function Spotlights({ resources: spotlightResources, activeIndex, moveSpotlight, setSpotlightIndex }) {
  return (
    <section id="spotlights" className="section section-anchor spotlights-section">
      <SectionHeading
        eyebrow="Spotlights"
        title="Five resources with outsized community value."
        text="The carousel rotates automatically and can also be controlled manually."
      />
      <div className="carousel" aria-roledescription="carousel">
        <button
          className="round-button"
          type="button"
          onClick={() => moveSpotlight(-1)}
          aria-label="Previous spotlight"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="spotlight-track">
          {spotlightResources.map((resource, index) => {
            const offset =
              (index - activeIndex + spotlightResources.length) %
              spotlightResources.length;
            const position =
              offset === 0 ? "active" : offset === 1 ? "next" : offset === spotlightResources.length - 1 ? "previous" : "hidden";

            return (
              <article
                className={`spotlight-card ${position}`}
                key={resource.id}
                aria-hidden={position === "hidden"}
              >
                <span
                  className="spotlight-logo"
                  style={{ "--accent": resource.accent }}
                  aria-hidden="true"
                >
                  {resource.shortName}
                </span>
                <p className="card-kicker">{resource.categories[0]}</p>
                <h3>{resource.name}</h3>
                <p>{resource.details}</p>
                <a href={resource.website} target="_blank" rel="noreferrer">
                  Open website
                </a>
              </article>
            );
          })}
        </div>
        <button
          className="round-button"
          type="button"
          onClick={() => moveSpotlight(1)}
          aria-label="Next spotlight"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <div className="carousel-dots" aria-label="Spotlight slides">
        {spotlightResources.map((resource, index) => (
          <button
            key={resource.id}
            type="button"
            className={activeIndex === index ? "is-active" : ""}
            onClick={() => setSpotlightIndex(index)}
            aria-label={`Show ${resource.name}`}
          />
        ))}
      </div>
    </section>
  );
}

function Events({ eventCategory, setEventCategory, visibleEvents }) {
  return (
    <section id="events" className="section section-anchor">
      <SectionHeading
        eyebrow="Events calendar"
        title="Upcoming clinics, volunteer days, and community programs."
        text="This enhancement shows how the hub can become a living calendar during the winter season."
      />
      <div className="events-toolbar">
        <label className="field compact">
          <span>Filter events</span>
          <select
            value={eventCategory}
            onChange={(event) => setEventCategory(event.target.value)}
          >
            <option>All categories</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="event-grid">
        {visibleEvents.map((event) => (
          <article className="event-card" key={event.id}>
            <time>{event.date}</time>
            <div>
              <span>{event.category}</span>
              <h3>{event.title}</h3>
              <p>
                {event.host} · {event.region}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MapSection({ activeRegion, setActiveRegion, activeRegionResources }) {
  return (
    <section id="map" className="section section-anchor map-section">
      <SectionHeading
        eyebrow="Interactive map"
        title="Browse resources by Utah snow-sport region."
        text="A region-based map keeps the interface usable without requiring exact user addresses."
      />
      <div className="map-layout">
        <div className="map-panel" aria-label="Utah region selector">
          {regions.map((region, index) => (
            <button
              key={region}
              className={`region-node ${activeRegion === region ? "is-active" : ""}`}
              style={{ "--node-index": index }}
              type="button"
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
        <div className="region-list">
          <p className="eyebrow">{activeRegion}</p>
          <h3>{activeRegionResources.length} matching resources</h3>
          <ul>
            {activeRegionResources.slice(0, 6).map((resource) => (
              <li key={resource.id}>
                <strong>{resource.name}</strong>
                <span>{resource.categories.slice(0, 2).join(" · ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function GuidesAndMatching({ matchChoice, setMatchChoice, matchedResources }) {
  return (
    <section className="section split-section">
      <div>
        <SectionHeading
          eyebrow="Resource guides"
          title="A simple flow for safer, more connected snow days."
          text="These guides add end-user value beyond the directory."
        />
        <div className="guide-grid">
          {guideCards.map((guide) => (
            <article className="guide-card" key={guide.title}>
              <h3>{guide.title}</h3>
              <p>{guide.text}</p>
            </article>
          ))}
        </div>
      </div>
      <aside className="match-panel" aria-label="Volunteer matching tool">
        <p className="eyebrow">Volunteer matcher</p>
        <h2>Find organizations aligned with your interests.</h2>
        <label className="field">
          <span>Interest area</span>
          <select
            value={matchChoice}
            onChange={(event) => setMatchChoice(event.target.value)}
          >
            {matchOptions.map((option) => (
              <option key={option.label}>{option.label}</option>
            ))}
          </select>
        </label>
        <div className="match-results">
          {matchedResources.map((resource) => (
            <a key={resource.id} href={resource.website} target="_blank" rel="noreferrer">
              <strong>{resource.name}</strong>
              <span>{resource.region}</span>
            </a>
          ))}
        </div>
      </aside>
    </section>
  );
}

function SubmitResource({ handleSubmit, submissionStatus }) {
  return (
    <section id="submit" className="section section-anchor submit-section">
      <SectionHeading
        eyebrow="Submit a resource"
        title="Help the hub stay current."
        text="Submissions would normally go to a moderator. For the competition site, the form validates input and shows a confirmation state."
      />
      <form className="submit-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Organization or resource name</span>
          <input name="name" required placeholder="Example: Mountain Access Fund" />
        </label>
        <label className="field">
          <span>Website URL</span>
          <input name="website" required type="url" placeholder="https://example.org" />
        </label>
        <label className="field">
          <span>Contact email or phone</span>
          <input name="contact" required placeholder="info@example.org or 801-555-0123" />
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" required defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Location</span>
          <select name="location" required defaultValue="">
            <option value="" disabled>
              Select a region
            </option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Who it serves</span>
          <input name="serves" required placeholder="Youth, families, adaptive athletes..." />
        </label>
        <label className="field full">
          <span>Description</span>
          <textarea
            name="description"
            required
            rows="5"
            placeholder="Describe the resource, eligibility, and how community members can use it."
          />
        </label>
        <button className="button primary" type="submit">
          Submit resource
        </button>
        <p className="form-status" role="status">
          {submissionStatus}
        </p>
      </form>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section section-anchor about-section">
      <div>
        <p className="eyebrow">About this hub</p>
        <h2>Built for the people who keep winter moving.</h2>
      </div>
      <p>
        The snow sport community includes students learning their first turns,
        avalanche educators, adaptive athletes, seasonal workers, resort towns,
        artists, volunteers, advocates, and families who depend on healthy
        mountains. This website organizes the support system around that
        community so help is easier to find.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <p>SnowUT</p>
      <p>Designed for accessible community discovery, safety, and connection.</p>
    </footer>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default App;
