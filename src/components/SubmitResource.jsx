import { categories, regions } from "../data/resources";
import SectionHeading from "./SectionHeading";

function SubmitResource({ handleSubmit, submissionStatus }) {
  return (
    <section id="submit" className="section section-anchor submit-section">
      <SectionHeading
        eyebrow="Submit a resource"
        title="Help the hub stay current."
        text="Share a resource to help others discover support."
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

function ModerationQueue({ submissions, updateStatus }) {
  return (
    <section className="section moderation-section">
      <SectionHeading
        eyebrow="Moderator queue"
        title="Review pending submissions."
        text="Manage new community submissions."
      />
      <div className="moderation-list">
        {submissions.length === 0 ? (
          <p>No submissions in queue.</p>
        ) : (
          submissions.map((submission) => (
            <article className="moderation-card" key={submission.id}>
              <div>
                <strong>{submission.name}</strong>
                <p>{submission.description}</p>
                <p>
                  {submission.category} · {submission.location} · {submission.contact}
                </p>
                <p>Status: {submission.status}</p>
              </div>
              <div className="moderation-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => updateStatus(submission.id, "approved")}
                >
                  Approve
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => updateStatus(submission.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export { SubmitResource, ModerationQueue };
