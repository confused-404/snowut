import SectionHeading from "./SectionHeading";
import ResourceLogo from "./ResourceLogo";

function Spotlights({
  resources,
  activeIndex,
  moveSpotlight,
  setSpotlightIndex,
  autoRotate,
  setAutoRotate,
}) {
  return (
    <section id="spotlights" className="section section-anchor spotlights-section">
      <SectionHeading
        eyebrow="Spotlights"
        title="Five resources with outsized community value."
        text="The carousel rotates automatically and can also be controlled manually."
      />
      <div className="carousel-controls">
        <button
          className="button secondary"
          type="button"
          onClick={() => setAutoRotate((value) => !value)}
          aria-pressed={autoRotate}
        >
          {autoRotate ? "Pause rotation" : "Resume rotation"}
        </button>
      </div>
      <div className="carousel" aria-roledescription="carousel" aria-label="Featured resource spotlights">
        <button
          className="round-button"
          type="button"
          onClick={() => moveSpotlight(-1)}
          aria-label="Previous spotlight"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="spotlight-track" aria-live="polite">
          {resources.map((resource, index) => {
            const offset = (index - activeIndex + resources.length) % resources.length;
            const position =
              offset === 0
                ? "active"
                : offset === 1
                  ? "next"
                  : offset === resources.length - 1
                    ? "previous"
                    : "hidden";

            return (
              <article
                className={`spotlight-card ${position}`}
                key={resource.id}
                aria-hidden={position === "hidden"}
              >
                <ResourceLogo
                  resourceId={resource.id}
                  className="spotlight-logo"
                  website={resource.website}
                  shortName={resource.shortName}
                  accent={resource.accent}
                />
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
        {resources.map((resource, index) => (
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

export default Spotlights;
