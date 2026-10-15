import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getWeatherBundleByCity, getWeatherBundleByCoordinates } from "../src/services/weatherApi.ts";

const originalFetch = globalThis.fetch;
const originalKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  else process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = originalKey;
});

test("city lookup geocodes once and uses the same coordinates and units for both weather requests", async () => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  const requests: URL[] = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    assert.equal(url.searchParams.get("appid"), "test-key");
    if (url.pathname.endsWith("/direct")) {
      assert.equal(url.searchParams.get("q"), "Montreal");
      return Response.json([{ lat: 45.5, lon: -73.6, name: "Montréal", state: "Quebec", country: "CA" }]);
    }
    assert.equal(url.searchParams.get("lat"), "45.5");
    assert.equal(url.searchParams.get("lon"), "-73.6");
    assert.equal(url.searchParams.get("units"), "imperial");
    return Response.json(url.pathname.endsWith("/weather") ? { name: "Montreal" } : { list: [] });
  };
  const bundle = await getWeatherBundleByCity(" Montreal ", "imperial");
  assert.equal(requests.length, 3);
  assert.equal(bundle.location?.name, "Montréal");
  assert.equal(bundle.location?.country, "CA");
  assert.deepEqual(bundle.forecast, { list: [] });
});

test("coordinate lookup accepts zero and negative coordinates and defaults to metric", async () => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  let calls = 0;
  globalThis.fetch = async (input) => {
    calls += 1;
    const url = new URL(String(input));
    assert.equal(url.searchParams.get("lat"), "0");
    assert.equal(url.searchParams.get("lon"), "-73.6");
    assert.equal(url.searchParams.get("units"), "metric");
    return Response.json({});
  };
  await getWeatherBundleByCoordinates(0, -73.6);
  assert.equal(calls, 2);
});

test("missing API configuration fails before making a network request", async () => {
  delete process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  globalThis.fetch = async () => { throw new Error("Unexpected network request"); };
  await assert.rejects(getWeatherBundleByCity("Montreal"), /Missing OpenWeather API key/);
});

test("unknown city stops before current-weather or forecast requests", async () => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json([]); };
  await assert.rejects(getWeatherBundleByCity("Unknown"), /Could not find that city/);
  assert.equal(calls, 1);
});

test("invalid coordinates fail before making weather requests", async () => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  globalThis.fetch = async () => { throw new Error("Unexpected network request"); };
  await assert.rejects(getWeatherBundleByCoordinates(91, 0), /valid latitude and longitude/);
});

test("API failures and connection failures produce useful errors", async () => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  globalThis.fetch = async () => Response.json({ message: "Invalid API key" }, { status: 401 });
  await assert.rejects(getWeatherBundleByCoordinates(45, -73), /Invalid API key/);
  globalThis.fetch = async () => { throw new TypeError("Network request failed"); };
  await assert.rejects(getWeatherBundleByCoordinates(45, -73), /Check your connection/);
});

test("unreadable API responses produce an actionable error", async () => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  globalThis.fetch = async () => new Response("not json", { status: 200 });
  await assert.rejects(getWeatherBundleByCoordinates(45, -73), /unreadable response/);
});

test("slow weather requests time out instead of leaving the interface busy indefinitely", async (context) => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = "test-key";
  context.mock.timers.enable({ apis: ["setTimeout"] });
  globalThis.fetch = (_input, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
  });
  const result = assert.rejects(getWeatherBundleByCoordinates(45, -73), /timed out/);
  context.mock.timers.tick(15_000);
  await result;
});
