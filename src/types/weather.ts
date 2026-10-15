export type Units = "metric" | "imperial";
export type Coordinates = { lat: number; lon: number };

export type CurrentWeather = {
  coord: Coordinates;
  name: string;
  sys: { country?: string };
  timezone: number;
  weather: { description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number };
  visibility: number;
};

export type ForecastReading = {
  dt: number;
  main: { temp_min: number; temp_max: number };
  weather?: { icon?: string; description?: string }[];
};

export type ForecastResponse = {
  city?: { timezone?: number };
  list?: ForecastReading[];
};

export type LocationName = { name: string; state?: string; country?: string };
export type GeocodedLocation = Coordinates & LocationName;
export type WeatherBundle = {
  weather: CurrentWeather;
  forecast: ForecastResponse;
  location?: LocationName;
};

export type DailyForecast = {
  date: string;
  timestamp: number;
  min: number;
  max: number;
  icon: string;
  description: string;
  isToday: boolean;
};

export type WeatherDisplay = {
  location: string;
  localDateTime: string;
  description: string;
  iconUrl?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibilityKm: number;
  units: Units;
};

export type ForecastDisplay = {
  date: string;
  label: string;
  description: string;
  iconUrl?: string;
  high: number;
  low: number;
  isToday: boolean;
};
