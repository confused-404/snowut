import { describe, expect, it } from "vitest";
import { buildSubmission, toICS, validateSubmission } from "./submissions";

describe("validateSubmission", () => {
  const validInput = {
    name: "Demo Org",
    website: "https://example.org",
    contact: "info@example.org",
    category: "Safety",
    location: "Statewide",
    serves: "Families",
    description: "Useful support for winter communities.",
  };

  it("returns valid for a complete payload", () => {
    const result = validateSubmission(validInput);
    expect(result.valid).toBe(true);
  });

  it("returns invalid for malformed URL", () => {
    const result = validateSubmission({
      ...validInput,
      website: "not-a-url",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("valid website URL");
  });
});

describe("submission helpers", () => {
  it("builds a pending submission object", () => {
    const submission = buildSubmission({
      name: "Demo Org",
      website: "https://example.org",
    });
    expect(submission.id).toContain("submission-");
    expect(submission.status).toBe("pending");
  });

  it("builds an ICS file body for events", () => {
    const ics = toICS({
      id: "demo-event",
      date: "Jan 10",
      title: "Demo Event",
      host: "Demo Host",
      region: "Statewide",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Demo Event");
  });
});
