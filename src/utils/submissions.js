const SUBMISSION_STORAGE_KEY = "snowut-submissions";

export function getSubmissionStorageKey() {
  return SUBMISSION_STORAGE_KEY;
}

export function validateSubmission(values) {
  const required = [
    "name",
    "website",
    "contact",
    "category",
    "location",
    "serves",
    "description",
  ];
  const missing = required.filter((field) => !String(values[field] ?? "").trim());
  if (missing.length > 0) {
    return { valid: false, error: "Please complete all required fields." };
  }

  try {
    // Throws when URL is invalid.
    new URL(values.website);
  } catch {
    return { valid: false, error: "Please enter a valid website URL." };
  }

  return { valid: true, error: "" };
}

export function buildSubmission(values) {
  return {
    id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    ...values,
  };
}

export function toICS(eventItem) {
  const startDate = new Date(`${new Date().getFullYear()} ${eventItem.date} 18:00:00`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const compact = (value) => value.replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SnowUT//Events//EN",
    "BEGIN:VEVENT",
    `UID:${eventItem.id}@snowut.local`,
    `DTSTAMP:${compact(new Date().toISOString())}`,
    `DTSTART:${compact(startDate.toISOString())}`,
    `DTEND:${compact(endDate.toISOString())}`,
    `SUMMARY:${eventItem.title}`,
    `DESCRIPTION:Hosted by ${eventItem.host} in ${eventItem.region}`,
    `LOCATION:${eventItem.region}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
