import { useEffect, useMemo, useState } from "react";
import { events } from "./data/events";
import { resources } from "./data/resources";
import Directory from "./components/Directory";
import Spotlights from "./components/Spotlights";
import EventsSection from "./components/EventsSection";
import {
  About,
  Footer,
  GuidesAndMatching,
  Header,
  Hero,
  MapSection,
  SavedResources,
  Stats,
  matchOptions,
} from "./components/LayoutSections";
import { ModerationQueue, SubmitResource } from "./components/SubmitResource";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { filterAndSortResources } from "./utils/resourceFilters";
import {
  buildSubmission,
  getSubmissionStorageKey,
  validateSubmission,
} from "./utils/submissions";

function App() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All regions");
  const [selectedAudience, setSelectedAudience] = useState("All audiences");
  const [expandedResource, setExpandedResource] = useState(resources[0].id);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeRegion, setActiveRegion] = useState("Statewide");
  const [eventCategory, setEventCategory] = useState("All categories");
  const [matchChoice, setMatchChoice] = useState(matchOptions[0].label);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [sortMode, setSortMode] = useState("alphabetical");
  const [userLocation, setUserLocation] = useState(null);
  const [savedResourceIds, setSavedResourceIds] = useLocalStorage(
    "snowut-saved-resources",
    [],
  );
  const [submissions, setSubmissions] = useLocalStorage(
    getSubmissionStorageKey(),
    [],
  );

  const featuredResources = useMemo(
    () => resources.filter((resource) => resource.featured),
    [],
  );

  const filteredResources = useMemo(
    () =>
      filterAndSortResources(resources, {
        query,
        selectedCategories,
        selectedRegion,
        selectedAudience,
        savedIds: savedResourceIds,
        sortMode,
        userLocation,
      }),
    [
      query,
      savedResourceIds,
      selectedCategories,
      selectedRegion,
      selectedAudience,
      sortMode,
      userLocation,
    ],
  );

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

  const savedResources = useMemo(
    () => resources.filter((resource) => savedResourceIds.includes(resource.id)),
    [savedResourceIds],
  );

  const pendingSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === "pending"),
    [submissions],
  );

  useEffect(() => {
    if (!autoRotate || featuredResources.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSpotlightIndex((current) => (current + 1) % featuredResources.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [autoRotate, featuredResources.length]);

  useEffect(() => {
    const payload = {
      event: "directory_filters_changed",
      query,
      selectedCategories,
      selectedRegion,
      selectedAudience,
      count: filteredResources.length,
    };
    window.dispatchEvent(new CustomEvent("snowut:analytics", { detail: payload }));
    if (window.gtag) {
      window.gtag("event", payload.event, payload);
    }
  }, [
    filteredResources.length,
    query,
    selectedAudience,
    selectedCategories,
    selectedRegion,
  ]);

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

  function toggleSavedResource(resourceId) {
    setSavedResourceIds((current) =>
      current.includes(resourceId)
        ? current.filter((item) => item !== resourceId)
        : [...current, resourceId],
    );
  }

  function clearSavedResources() {
    setSavedResourceIds([]);
  }

  function requestUserLocation() {
    if (!window.navigator.geolocation) {
      setSubmissionStatus("Location is not available in this browser.");
      return;
    }

    window.navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      () => setSubmissionStatus("Unable to read location. Check browser permissions."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  function updateSubmissionStatus(submissionId, status) {
    setSubmissions((current) =>
      current.map((item) =>
        item.id === submissionId ? { ...item, status } : item,
      ),
    );
  }

  function handleSubmit(formEvent) {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const validation = validateSubmission(values);

    if (!validation.valid) {
      setSubmissionStatus(validation.error);
      return;
    }

    const submission = buildSubmission(values);
    setSubmissions((current) => [submission, ...current]);
    form.reset();
    setSubmissionStatus("Thank you. Your resource was submitted successfully.");
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
          sortMode={sortMode}
          setSortMode={setSortMode}
          requestUserLocation={requestUserLocation}
          savedResourceIds={savedResourceIds}
          toggleSavedResource={toggleSavedResource}
        />
        <Spotlights
          resources={featuredResources}
          activeIndex={spotlightIndex}
          moveSpotlight={moveSpotlight}
          setSpotlightIndex={setSpotlightIndex}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
        />
        <EventsSection
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
        <SavedResources
          savedResources={savedResources}
          onClear={clearSavedResources}
        />
        <SubmitResource
          handleSubmit={handleSubmit}
          submissionStatus={submissionStatus}
        />
        <ModerationQueue
          submissions={pendingSubmissions}
          updateStatus={updateSubmissionStatus}
        />
        <About />
      </main>
      <Footer />
    </>
  );
}

export default App;
