// utils/browser-router.ts

function getQueryParamCaseInsensitive({
  name,
  fromUrl,
}: {
  name: string;
  fromUrl?: string;
}): string | null {
  try {
    const url = new URL(fromUrl ?? window.location.href);
    name = name.toLowerCase();

    for (const [key, value] of url.searchParams.entries()) {
      if (key.toLowerCase() === name) return value;
    }
  } catch (err) {
    console.warn(
      "Failed to parse URL in getQueryParamCaseInsensitive:",
      fromUrl
    );
    console.error(err);
  }

  return null;
}

function isStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function deserializeStateFromUrl<T>(
  validate?: (data: unknown) => data is T
): T | null {
  const stateKey = getQueryParamCaseInsensitive({ name: "stateKey" });
  if (!stateKey) return null;

  try {
    const raw = localStorage.getItem(stateKey);
    if (!raw) return null;

    localStorage.removeItem(stateKey); // one-time read
    const parsed = JSON.parse(raw);

    if (validate && !validate(parsed)) {
      console.warn("State validation failed:", parsed);
      return null;
    }

    return parsed as T;
  } catch (err) {
    console.warn("Failed to deserialize state from localStorage:", err);
    return null;
  }
}

interface NavArgs {
  url: string;
  state?: object;
}

export default class BrowserRouter {
  static goToPage({ url, state }: NavArgs) {
    const finalUrl = this.#buildFinalUrl(url, state);
    window.location.href = finalUrl;
  }

  static returnToReferrerOrDefault(args?: Partial<NavArgs>) {
    const { url, state } = args ?? {};
    const currentUrl = new URL(window.location.href);

    const candidates = [
      getQueryParamCaseInsensitive({ name: "referrer" }),
      document.referrer,
    ];

    for (const ref of candidates) {
      if (!ref) continue;

      try {
        const refUrl = new URL(ref, window.location.origin);
        const isSamePage =
          refUrl.origin === currentUrl.origin &&
          refUrl.pathname === currentUrl.pathname &&
          refUrl.search === currentUrl.search;

        if (!isSamePage) {
          window.location.href = this.#buildFinalUrl(ref, state);
          return;
        }
      } catch (err) {
        console.warn("Invalid referrer URL ignored:", ref);
        console.error("Error in referrer URL:", err);
      }
    }

    if (url) {
      window.location.href = this.#buildFinalUrl(url, state);
    } else if (window.history.length > 0) {
      window.history.back();
    } else {
      window.location.href = this.#buildFinalUrl("/", state);
    }
  }

  static getDeserializedState<T>(
    validate?: (data: unknown) => data is T
  ): T | null {
    return deserializeStateFromUrl(validate);
  }

  static clearStateFromUrl() {
    const stateKey = getQueryParamCaseInsensitive({ name: "stateKey" });
    if (stateKey && isStorageAvailable()) {
      try {
        localStorage.removeItem(stateKey);
      } catch {
        // silent fail
      }
    }
  }

  static #buildFinalUrl(url: string, state?: object): string {
    const target = new URL(url, window.location.origin);

    // Referrer propagation
    if (!target.searchParams.has("referrer")) {
      const previousReferrer = getQueryParamCaseInsensitive({
        name: "referrer",
        fromUrl: document.referrer,
      });
      const candidateReferrer = previousReferrer ?? window.location.href;
      target.searchParams.set("referrer", candidateReferrer);
    }

    // State serialization
    if (state && isStorageAvailable()) {
      const stateKey = `navstate_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
      try {
        localStorage.setItem(stateKey, JSON.stringify(state));
        target.searchParams.set("stateKey", stateKey);
      } catch (err) {
        console.warn("Failed to save navigation state to localStorage:", err);
      }
    }

    return target.toString();
  }
}
