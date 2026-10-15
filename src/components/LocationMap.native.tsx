import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import type { Coordinates } from "../types/weather";
import type { LocationMapProps } from "./LocationMap.types";

const DEFAULT_REGION: Region = { latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 };

function regionFor(position: Coordinates): Region {
  return { latitude: position.lat, longitude: position.lon, latitudeDelta: 0.5, longitudeDelta: 0.5 };
}

export default function LocationMap({ position, locationName, onSelect, disabled = false, dark }: LocationMapProps) {
  const map = useRef<MapView>(null);

  useEffect(() => {
    if (position) map.current?.animateToRegion(regionFor(position), 500);
  }, [position]);

  return (
    <MapView
      ref={map}
      style={styles.map}
      initialRegion={position ? regionFor(position) : DEFAULT_REGION}
      userInterfaceStyle={dark ? "dark" : "light"}
      onMapReady={() => { if (position) map.current?.animateToRegion(regionFor(position), 500); }}
      onPress={({ nativeEvent }) => {
        if (!disabled && nativeEvent.action !== "marker-press") {
          onSelect(nativeEvent.coordinate.latitude, nativeEvent.coordinate.longitude);
        }
      }}
      accessibilityLabel="Weather location map. Tap to choose search coordinates."
    >
      {position && <Marker coordinate={{ latitude: position.lat, longitude: position.lon }} title={locationName || "Selected location"} />}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
