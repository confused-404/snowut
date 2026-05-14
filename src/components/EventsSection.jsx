import { categories } from "../data/resources";
import SectionHeading from "./SectionHeading";
import { toICS } from "../utils/submissions";

const eventDetails = {
  "park-silly-june-28": {
    infoUrl: "https://parksillysundaymarket.com/",
    details:
      "Open-air market on Historic Main Street with local vendors, community booths, and live programming.",
  },
  "kimball-arts-festival": {
    infoUrl: "https://kimballartcenter.org/exhibition/kimball-arts-festival/",
    details:
      "Park City's annual juried arts festival with artist booths, music, and community programming.",
  },
  "utah-state-fair": {
    infoUrl: "https://www.utahstatefair.com/",
    details:
      "Statewide fair featuring community exhibits, local food, arts, and family programming at the Fairpark.",
  },
  "driving-out-hunger": {
    infoUrl: "https://www.utahfoodbank.org/events/driving-out-hunger/",
    details:
      "Utah Food Bank golf fundraiser supporting statewide hunger relief and community food access programs.",
  },
  "utah-human-race": {
    infoUrl: "https://www.utahfoodbank.org/events/utah-human-race/",
    details:
      "Thanksgiving 5K/10K event that raises meals and support for Utah families through Utah Food Bank.",
  },
};

function downloadCalendarEvent(eventItem) {
  const content = toICS(eventItem);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${eventItem.id}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function EventsSection({ eventCategory, setEventCategory, visibleEvents }) {
  return (
    <section id="events" className="section section-anchor">
      <SectionHeading
        eyebrow="Events calendar"
        title="Upcoming clinics, volunteer days, and community programs."
        text="Find upcoming community events and ways to get involved."
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
        {visibleEvents.map((eventItem) => {
          const detail = eventDetails[eventItem.id];
          return (
            <article className="event-card" key={eventItem.id}>
              <time>{eventItem.date}</time>
              <div>
                <span>{eventItem.category}</span>
                <h3>{eventItem.title}</h3>
                <p>
                  {eventItem.host} · {eventItem.region}
                </p>
                {detail && <p>{detail.details}</p>}
                <div className="event-actions">
                  {detail?.infoUrl && (
                    <a href={detail.infoUrl} target="_blank" rel="noreferrer">
                      Event details
                    </a>
                  )}
                  <button type="button" className="button secondary" onClick={() => downloadCalendarEvent(eventItem)}>
                    Add to calendar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default EventsSection;
