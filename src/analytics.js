const STORAGE_KEY = "snowut-analytics-events";

export function initAnalytics() {
  window.addEventListener("snowut:analytics", (event) => {
    const detail = event.detail ?? {};
    const payload = {
      ...detail,
      at: new Date().toISOString(),
    };

    try {
      const history = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      history.unshift(payload);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    } catch {
      // Ignore localStorage errors.
    }

    if (import.meta.env.DEV) {
      // Useful for quick local inspection without adding an analytics SDK.
      console.info("[snowut analytics]", payload);
    }
  });
}
