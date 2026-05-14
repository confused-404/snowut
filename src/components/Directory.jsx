import { audiences, categories, regions } from "../data/resources";
import SectionHeading from "./SectionHeading";
import ResourceLogo from "./ResourceLogo";

function ResourceCard({ resource, expanded, onToggle, isSaved, onToggleSaved }) {
  const detailsId = `resource-details-${resource.id}`;
  return (
    <article className="resource-card" style={{ "--accent": resource.accent }}>
      <button
        className="card-button"
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailsId}
      >
        <ResourceLogo
          resourceId={resource.id}
          className="resource-logo"
          website={resource.website}
          shortName={resource.shortName}
          accent={resource.accent}
        />
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
        <div className="card-details" id={detailsId}>
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
          <div className="card-actions">
            <a href={resource.website} target="_blank" rel="noreferrer">
              Visit resource
            </a>
            <button
              className="button secondary"
              type="button"
              onClick={onToggleSaved}
              aria-pressed={isSaved}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      )}
    </article>
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
    sortMode,
    setSortMode,
    requestUserLocation,
    savedResourceIds,
    toggleSavedResource,
  } = props;

  return (
    <section id="directory" className="section section-anchor">
      <SectionHeading
        eyebrow="Resource directory"
        title="Search by need, place, or who the resource serves."
        text="Use filters to find resources that fit your needs."
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
            <span>Sort</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
              <option value="alphabetical">Alphabetical</option>
              <option value="saved-first">Saved first</option>
              <option value="nearby">Near me</option>
            </select>
          </label>
          {sortMode === "nearby" && (
            <button className="button secondary location-button" type="button" onClick={requestUserLocation}>
              Use my location
            </button>
          )}

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
                  className={`chip ${selectedCategories.includes(category) ? "is-active" : ""}`}
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
          {filteredResources.length === 0 ? (
            <div className="empty-state">
              <h3>No matches yet</h3>
              <p>Try broadening your keywords or resetting your filters.</p>
              <button className="button secondary" type="button" onClick={clearFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="resource-grid">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  expanded={expandedResource === resource.id}
                  onToggle={() =>
                    setExpandedResource((current) => (current === resource.id ? "" : resource.id))
                  }
                  isSaved={savedResourceIds.includes(resource.id)}
                  onToggleSaved={() => toggleSavedResource(resource.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Directory;
