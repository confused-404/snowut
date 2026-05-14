import { useMemo, useState } from "react";

function getDomain(website) {
  try {
    return new URL(website).hostname;
  } catch {
    return "";
  }
}

function clearbitLogo(website) {
  const domain = getDomain(website);
  return domain ? `https://logo.clearbit.com/${domain}` : "";
}

function faviconLogo(website) {
  const domain = getDomain(website);
  return domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : "";
}

function ResourceLogo({ resourceId, website, shortName, accent, className }) {
  const clearbit = useMemo(() => clearbitLogo(website), [website]);
  const fallback = useMemo(() => faviconLogo(website), [website]);
  const sources = useMemo(
    () =>
      [
        `/logos/${resourceId}.svg`,
        `/logos/${resourceId}.png`,
        `/logos/${resourceId}.webp`,
        `/logos/${resourceId}.jpg`,
        `/logos/${resourceId}.jpeg`,
        `/logos/${resourceId}.ico`,
        clearbit,
        fallback,
      ].filter(Boolean),
    [clearbit, fallback, resourceId],
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const [showInitials, setShowInitials] = useState(sources.length === 0);
  const src = sources[sourceIndex] ?? "";

  function handleError() {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex((current) => current + 1);
      return;
    }
    setShowInitials(true);
  }

  return (
    <span
      className={className}
      style={{ "--accent": accent }}
      aria-hidden="true"
    >
      {!showInitials && src ? (
        <img
          src={src}
          alt=""
          className="resource-logo-image"
          loading="lazy"
          decoding="async"
          onError={handleError}
        />
      ) : (
        shortName
      )}
    </span>
  );
}

export default ResourceLogo;
