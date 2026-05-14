import { describe, expect, it } from "vitest";
import { resources } from "../data/resources";
import { filterAndSortResources } from "./resourceFilters";

describe("filterAndSortResources", () => {
  it("matches synonym-expanded query terms", () => {
    const result = filterAndSortResources(resources, {
      query: "avalanche",
      selectedCategories: [],
      selectedRegion: "All regions",
      selectedAudience: "All audiences",
      savedIds: [],
      sortMode: "alphabetical",
      userLocation: null,
    });

    expect(result.some((resource) => resource.id === "utah-avalanche-center")).toBe(
      true,
    );
  });

  it("prioritizes saved resources when sorting saved-first", () => {
    const result = filterAndSortResources(resources, {
      query: "",
      selectedCategories: [],
      selectedRegion: "All regions",
      selectedAudience: "All audiences",
      savedIds: ["park-city-community-foundation"],
      sortMode: "saved-first",
      userLocation: null,
    });

    expect(result[0].id).toBe("park-city-community-foundation");
  });
});
