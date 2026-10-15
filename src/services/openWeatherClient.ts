const REQUEST_TIMEOUT_MS = 15_000;

export function getWeatherApiKey() {
  // Expo statically replaces this expression when it bundles the application.
  const key = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY?.trim();
  if (!key) throw new Error("Missing OpenWeather API key. Set EXPO_PUBLIC_OPENWEATHER_API_KEY in .env and restart Expo.");
  return key;
}

export async function requestOpenWeather<T>(
  endpoint: string,
  params: Record<string, string | number>,
  apiKey: string,
): Promise<T> {
  if (!apiKey.trim()) throw new Error("Missing OpenWeather API key.");
  const query = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    appid: apiKey,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let response: Response;
    try {
      response = await fetch(`${endpoint}?${query}`, { signal: controller.signal });
    } catch {
      throw new Error(controller.signal.aborted
        ? "The weather request timed out. Please try again."
        : "Unable to reach OpenWeather. Check your connection and try again.");
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(controller.signal.aborted
        ? "The weather request timed out. Please try again."
        : "OpenWeather returned an unreadable response. Please try again.");
    }
    if (!response.ok) {
      const message = typeof data?.message === "string" ? data.message : "Could not load weather data.";
      throw new Error(message);
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
