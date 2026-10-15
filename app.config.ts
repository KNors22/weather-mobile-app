import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    name: config.name || "weather-mobile-app",
    slug: config.slug || "weather-mobile-app",
    plugins: [
      ...(config.plugins || []),
      ...(mapsKey ? [["react-native-maps", { androidGoogleMapsApiKey: mapsKey }] as [string, Record<string, string>]] : []),
    ],
  };
};
