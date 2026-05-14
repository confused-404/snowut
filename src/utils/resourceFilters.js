const SEARCH_SYNONYMS = {
  avalanche: ["safety", "backcountry", "beacon"],
  youth: ["kids", "students", "families"],
  adaptive: ["accessibility", "disability", "inclusion"],
  climate: ["environmental", "air", "advocacy"],
  volunteer: ["stewardship", "community aid", "service"],
  aid: ["assistance", "support", "financial"],
};

export const REGION_COORDS = {
  Statewide: { lat: 39.32098, lon: -111.09373 },
  "Salt Lake Area": { lat: 40.76078, lon: -111.89105 },
  "Park City / Wasatch Back": { lat: 40.64606, lon: -111.49801 },
  "Northern Utah": { lat: 41.223, lon: -111.97383 },
  "Central Utah": { lat: 39.29028, lon: -111.09573 },
  "Southern Utah": { lat: 37.09653, lon: -113.56842 },
  "Online / National": { lat: 39.32098, lon: -111.09373 },
};

function normalize(value) {
  return value.trim().toLowerCase();
}

function searchBlob(resource) {
  return [
    resource.name,
    resource.description,
    resource.details,
    resource.region,
    resource.categories.join(" "),
    resource.audience.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function queryTerms(query) {
  const term = normalize(query);
  if (!term) {
    return [];
  }

  const expanded = new Set([term]);
  Object.entries(SEARCH_SYNONYMS).forEach(([key, synonyms]) => {
    if (term.includes(key) || synonyms.some((synonym) => term.includes(synonym))) {
      expanded.add(key);
      synonyms.forEach((synonym) => expanded.add(synonym));
    }
  });
  return [...expanded];
}

function distanceKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

export function filterAndSortResources(resources, options) {
  const {
    query,
    selectedCategories,
    selectedRegion,
    selectedAudience,
    savedIds,
    sortMode,
    userLocation,
  } = options;
  const terms = queryTerms(query);

  const filtered = resources.filter((resource) => {
    const blob = searchBlob(resource);
    const matchesQuery =
      terms.length === 0 || terms.some((term) => blob.includes(term));
    const matchesCategories =
      selectedCategories.length === 0 ||
      selectedCategories.some((category) => resource.categories.includes(category));
    const matchesRegion =
      selectedRegion === "All regions" || resource.region === selectedRegion;
    const matchesAudience =
      selectedAudience === "All audiences" || resource.audience.includes(selectedAudience);
    return matchesQuery && matchesCategories && matchesRegion && matchesAudience;
  });

  const sorted = [...filtered];
  if (sortMode === "saved-first") {
    sorted.sort((a, b) => Number(savedIds.includes(b.id)) - Number(savedIds.includes(a.id)));
  } else if (sortMode === "nearby" && userLocation) {
    sorted.sort((a, b) => {
      const aCoords = REGION_COORDS[a.region] ?? REGION_COORDS.Statewide;
      const bCoords = REGION_COORDS[b.region] ?? REGION_COORDS.Statewide;
      return distanceKm(userLocation, aCoords) - distanceKm(userLocation, bCoords);
    });
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sorted;
}
