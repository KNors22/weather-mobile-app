import { StyleSheet, Text, View } from "react-native";
import { weatherThemes } from "../styles/weatherStyles";
import type { LocationMapProps } from "./LocationMap.types";

// Metro selects LocationMap.native.tsx on devices. Keep the web route usable
// without importing a native-only map module into the browser bundle.
export default function LocationMap({ position, locationName, dark }: LocationMapProps) {
  const colors = weatherThemes[dark ? "dark" : "light"];
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.muted }]}>The interactive map is available on Android and iOS. Search by city or coordinates here.</Text>
      {position && <Text style={[styles.text, { color: colors.text }]}>{locationName || "Selected location"}: {position.lat.toFixed(4)}, {position.lon.toFixed(4)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 8 },
  text: { textAlign: "center", fontSize: 14, lineHeight: 21 },
});
