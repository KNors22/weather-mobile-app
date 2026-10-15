import { requestOpenWeather } from "../services/openWeatherClient.ts";
import type { GeocodedLocation } from "../types/weather.ts";

type CoordinateInput = string | number | null | undefined;

function hasCoordinateValue(value: CoordinateInput) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function isValidLatitude(latitude: CoordinateInput) {
  const numericLatitude = Number(latitude);
  return hasCoordinateValue(latitude) && Number.isFinite(numericLatitude)
    && numericLatitude >= -90 && numericLatitude <= 90;
}

export function isValidLongitude(longitude: CoordinateInput) {
  const numericLongitude = Number(longitude);
  return hasCoordinateValue(longitude) && Number.isFinite(numericLongitude)
    && numericLongitude >= -180 && numericLongitude <= 180;
}

export async function getCoordinatesByCity(city: string, apiKey: string): Promise<GeocodedLocation> {
  const name = city.trim();
  if (!name) throw new Error("Please enter a city.");
  const results = await requestOpenWeather<GeocodedLocation[]>(
    "https://api.openweathermap.org/geo/1.0/direct", { q: name, limit: 1 }, apiKey,
  );
  if (!Array.isArray(results) || !results.length) throw new Error("Could not find that city.");
  const result = results[0];
  if (!isValidLatitude(result.lat) || !isValidLongitude(result.lon)) {
    throw new Error("OpenWeather returned an invalid location. Please try another city.");
  }
  return result;
}
