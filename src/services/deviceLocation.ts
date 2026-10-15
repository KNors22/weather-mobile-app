import type * as ExpoLocation from "expo-location";
import type { Coordinates } from "../types/weather.ts";

// Accept the native module as an adapter so permission and GPS failure paths
// can be tested without requiring a device or importing native code in Node.
type LocationProvider = Pick<typeof ExpoLocation,
  "requestForegroundPermissionsAsync" | "hasServicesEnabledAsync" | "getCurrentPositionAsync" | "Accuracy">;

export async function getDeviceCoordinates(location: LocationProvider): Promise<Coordinates> {
  const permission = await location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error(permission.canAskAgain
      ? "Location permission was denied. You can still search by city or coordinates."
      : "Location permission is disabled. Enable it in Settings, or search by city or coordinates.");
  }
  if (!(await location.hasServicesEnabledAsync())) {
    throw new Error("Location services are turned off. Enable them or search by city.");
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      location.getCurrentPositionAsync({ accuracy: location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Location lookup timed out. Try again or search by city.")), 20_000);
      }),
    ]);
    return { lat: result.coords.latitude, lon: result.coords.longitude };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Location lookup timed out")) throw error;
    throw new Error("Unable to determine your location. Try again or search by city or coordinates.");
  } finally {
    clearTimeout(timeout);
  }
}
