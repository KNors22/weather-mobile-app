import assert from "node:assert/strict";
import { test } from "node:test";
import { getDeviceCoordinates } from "../src/services/deviceLocation.ts";

type LocationProvider = Parameters<typeof getDeviceCoordinates>[0];
const grantedPermission = {
  granted: true, canAskAgain: true, expires: "never", status: "granted",
} as Awaited<ReturnType<LocationProvider["requestForegroundPermissionsAsync"]>>;

function provider(overrides: Partial<LocationProvider> = {}): LocationProvider {
  return {
    requestForegroundPermissionsAsync: async () => grantedPermission,
    hasServicesEnabledAsync: async () => true,
    getCurrentPositionAsync: async (options) => {
      assert.equal(options?.accuracy, 3);
      return {
        coords: { latitude: 45.5, longitude: -73.6, altitude: null, accuracy: 10, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
      };
    },
    Accuracy: { Balanced: 3 } as LocationProvider["Accuracy"],
    ...overrides,
  };
}

test("granted foreground permission retrieves device coordinates", async () => {
  assert.deepEqual(await getDeviceCoordinates(provider()), { lat: 45.5, lon: -73.6 });
});

test("denied permission keeps manual search available without requesting GPS", async () => {
  let gpsCalls = 0;
  const location = provider({
    requestForegroundPermissionsAsync: async () => ({ ...grantedPermission, granted: false }),
    getCurrentPositionAsync: async () => { gpsCalls += 1; throw new Error("Unexpected GPS request"); },
  });
  await assert.rejects(getDeviceCoordinates(location), /search by city or coordinates/);
  assert.equal(gpsCalls, 0);
});

test("permanently denied permission explains how to enable it", async () => {
  await assert.rejects(getDeviceCoordinates(provider({
    requestForegroundPermissionsAsync: async () => ({ ...grantedPermission, granted: false, canAskAgain: false }),
  })), /Settings/);
});

test("disabled location services produce a manual-search fallback", async () => {
  await assert.rejects(getDeviceCoordinates(provider({ hasServicesEnabledAsync: async () => false })), /turned off/);
});

test("GPS failures are explained without exposing platform-specific errors", async () => {
  await assert.rejects(getDeviceCoordinates(provider({
    getCurrentPositionAsync: async () => { throw new Error("Native GPS failure"); },
  })), /Unable to determine your location/);
});

test("GPS lookup times out so manual search can be used again", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const result = assert.rejects(getDeviceCoordinates(provider({
    getCurrentPositionAsync: () => new Promise(() => {}),
  })), /Location lookup timed out/);
  // Permission and service checks finish before the GPS deadline is scheduled.
  await Promise.resolve();
  await Promise.resolve();
  context.mock.timers.tick(20_000);
  await result;
});
