import { regions } from "../data/resources";
import SectionHeading from "./SectionHeading";

const navItems = [
  ["Home", "home"],
  ["Directory", "directory"],
  ["Spotlights", "spotlights"],
  ["Events", "events"],
  ["Map", "map"],
  ["Saved", "saved"],
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
  {
    label: "Community aid",
    categories: ["Community Support", "Financial Assistance"],
  },
];

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

function MapSection({ activeRegion, setActiveRegion, activeRegionResources }) {
  return (
    <section id="map" className="section section-anchor map-section">
      <SectionHeading
        eyebrow="Interactive map"
        title="Browse resources by Utah snow-sport region."
        text="Select a region to explore nearby and statewide resources."
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
          text="Quick tips for planning, riding, and giving back."
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

function SavedResources({ savedResources, onClear }) {
  return (
    <section id="saved" className="section section-anchor">
      <SectionHeading
        eyebrow="Saved resources"
        title="Keep your shortlist between sessions."
        text="Saved items are stored in your browser, so you can revisit them later."
      />
      <div className="saved-panel">
        {savedResources.length === 0 ? (
          <p>No saved resources yet. Use "Save" on any expanded resource card.</p>
        ) : (
          <>
            <ul>
              {savedResources.map((resource) => (
                <li key={resource.id}>
                  <strong>{resource.name}</strong>
                  <span>{resource.region}</span>
                </li>
              ))}
            </ul>
            <button className="button ghost" type="button" onClick={onClear}>
              Clear saved list
            </button>
          </>
        )}
      </div>
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

export {
  Header,
  Hero,
  Stats,
  MapSection,
  GuidesAndMatching,
  SavedResources,
  About,
  Footer,
  matchOptions,
};
