import { getCoordinatesByCity, isValidLatitude, isValidLongitude } from "../utils/location.ts";
import { getWeatherApiKey, requestOpenWeather } from "./openWeatherClient.ts";
import type { CurrentWeather, ForecastResponse, Units, WeatherBundle } from "../types/weather.ts";

const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

function validateCoordinates(lat: number, lon: number) {
  if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
    throw new Error("Please enter both valid latitude and longitude.");
  }
}

export function getWeatherByCoordinates(lat: number, lon: number, units: Units = "metric") {
  validateCoordinates(lat, lon);
  return requestOpenWeather<CurrentWeather>(CURRENT_WEATHER_URL, { lat, lon, units }, getWeatherApiKey());
}

export async function getWeatherByCity(city: string, units: Units = "metric") {
  const location = await getCoordinatesByCity(city, getWeatherApiKey());
  return getWeatherByCoordinates(location.lat, location.lon, units);
}

export function getForecastByCoordinates(lat: number, lon: number, units: Units = "metric") {
  validateCoordinates(lat, lon);
  return requestOpenWeather<ForecastResponse>(FORECAST_URL, { lat, lon, units }, getWeatherApiKey());
}

export async function getWeatherBundleByCoordinates(
  lat: number, lon: number, units: Units = "metric",
): Promise<WeatherBundle> {
  const [weather, forecast] = await Promise.all([
    getWeatherByCoordinates(lat, lon, units),
    getForecastByCoordinates(lat, lon, units),
  ]);
  return { weather, forecast };
}

export async function getWeatherBundleByCity(city: string, units: Units = "metric"): Promise<WeatherBundle> {
  const location = await getCoordinatesByCity(city, getWeatherApiKey());
  const bundle = await getWeatherBundleByCoordinates(location.lat, location.lon, units);
  return { ...bundle, location: { name: location.name, state: location.state, country: location.country } };
}
