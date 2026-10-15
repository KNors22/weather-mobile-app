import { useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "weather-app-theme";

export function useWeatherTheme() {
  const systemTheme = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const writes = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (active && (saved === "dark" || saved === "light")) setOverride(saved === "dark");
    }).catch(() => { /* Fall back to the system theme when storage is unavailable. */ })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const changeTheme = (dark: boolean) => {
    if (!ready) return;
    setOverride(dark);
    // Serialize quick toggles so the final choice is the one persisted.
    writes.current = writes.current.catch(() => {}).then(() =>
      AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light"),
    ).catch(() => { /* Keep the selected theme for this session if saving fails. */ });
  };

  return { isDarkMode: override ?? systemTheme === "dark", themeReady: ready, changeTheme };
}
