import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "react-native";
import * as Location from "expo-location";
import { getWeatherBundleByCity, getWeatherBundleByCoordinates } from "../services/weatherApi";
import { getDeviceCoordinates } from "../services/deviceLocation";
import { isValidLatitude, isValidLongitude } from "../utils/location";
import { normalizeForecast } from "../utils/forecast";
import { formatForecastDate, formatLocationDateTime } from "../utils/dateTime";
import type { Coordinates, ForecastDisplay, Units, WeatherBundle, WeatherDisplay } from "../types/weather";

export function useWeather() {
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [units, setUnits] = useState<Units>("metric");
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [mapPosition, setMapPosition] = useState<Coordinates | null>(null);
  const [mapLocationName, setMapLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!bundle) return;
    const timer = setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [bundle]);

  const runSearch = async (request: () => Promise<WeatherBundle>, nextUnits = units, preserveLocation = false) => {
    // The synchronous lock also catches double taps before the next render.
    if (busy.current) return;
    busy.current = true;
    Keyboard.dismiss();
    setError("");
    setLoading(true);
    try {
      const result = await request();
      if (!mounted.current) return;
      setBundle((previous) => preserveLocation && previous
        ? { ...result, location: previous.location } : result);
      setUnits(nextUnits);
      setCurrentTime(Date.now());
      setMapPosition(result.weather.coord);
      setMapLocationName(result.location?.name || result.weather.name);
      setLat(String(result.weather.coord.lat));
      setLon(String(result.weather.coord.lon));
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : "Unable to load weather. Please try again.");
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };

  const searchByCity = () => {
    if (busy.current) return;
    if (!city.trim()) { setError("Please enter a city."); return; }
    return runSearch(() => getWeatherBundleByCity(city.trim(), units));
  };

  const searchByCoordinates = () => {
    if (busy.current) return;
    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      setError("Enter a latitude between -90 and 90 and a longitude between -180 and 180.");
      return;
    }
    return runSearch(() => getWeatherBundleByCoordinates(Number(lat), Number(lon), units));
  };

  const searchCurrentLocation = () => runSearch(async () => {
    const coordinates = await getDeviceCoordinates(Location);
    return getWeatherBundleByCoordinates(coordinates.lat, coordinates.lon, units);
  });

  const changeUnits = (nextUnits: Units) => {
    if (busy.current || nextUnits === units) return;
    if (!bundle) { setUnits(nextUnits); return; }
    const { lat, lon } = bundle.weather.coord;
    return runSearch(() => getWeatherBundleByCoordinates(lat, lon, nextUnits), nextUnits, true);
  };

  const selectMapLocation = (latitude: number, longitude: number) => {
    if (busy.current) return;
    setLat(latitude.toFixed(6));
    setLon(longitude.toFixed(6));
    setMapPosition({ lat: latitude, lon: longitude });
    setMapLocationName("");
  };

  const weather = useMemo<WeatherDisplay | null>(() => {
    if (!bundle) return null;
    const data = bundle.weather;
    const condition = data.weather[0];
    const name = bundle.location?.name || data.name;
    const country = bundle.location?.country || data.sys.country;
    return {
      location: country ? `${name}, ${country}` : name,
      localDateTime: formatLocationDateTime(currentTime, data.timezone),
      description: condition?.description || "Weather unavailable",
      iconUrl: condition?.icon ? `https://openweathermap.org/img/wn/${condition.icon}@2x.png` : undefined,
      temperature: data.main.temp, feelsLike: data.main.feels_like,
      humidity: data.main.humidity, pressure: data.main.pressure,
      windSpeed: data.wind.speed, visibilityKm: data.visibility / 1000, units,
    };
  }, [bundle, currentTime, units]);

  const forecast = useMemo<ForecastDisplay[]>(() => normalizeForecast(bundle?.forecast, currentTime).map((day) => ({
    date: day.date, label: formatForecastDate(day.date, day.isToday),
    description: day.description,
    iconUrl: day.icon ? `https://openweathermap.org/img/wn/${day.icon}@2x.png` : undefined,
    high: day.max, low: day.min, isToday: day.isToday,
  })), [bundle, currentTime]);

  return {
    city, setCity, lat, setLat, lon, setLon, units, changeUnits,
    weather, forecast, loading, error, setError,
    mapPosition, mapLocationName, selectMapLocation,
    searchByCity, searchByCoordinates, searchCurrentLocation,
  };
}
