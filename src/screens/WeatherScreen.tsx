import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
  useAnimatedValue,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createWeatherStyles, weatherThemes } from "../styles/weatherStyles";

type Units = "metric" | "imperial";
type WeatherStyles = ReturnType<typeof createWeatherStyles>;

// Display data is supplied by a future integration; no API or utilities are
// imported here during the interface-only migration.
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
};

type WeatherScreenProps = {
  weather?: WeatherDisplay | null;
  forecast?: readonly ForecastDisplay[];
  loading?: boolean;
  error?: string;
};

function FadeIn({ children, style, delay = 0 }: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  // Start visible while checking the device's reduced-motion preference.
  const progress = useAnimatedValue(1);

  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active || reduceMotion) return;
      progress.setValue(0);
      animation = Animated.timing(progress, {
        toValue: 1, duration: 300, delay, useNativeDriver: true,
      });
      animation.start();
    }).catch(() => { /* Keep content visible if the preference cannot be read. */ });
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", (reduceMotion) => {
      if (reduceMotion) {
        animation?.stop();
        progress.setValue(1);
      }
    });
    return () => { active = false; animation?.stop(); listener.remove(); };
  }, [delay, progress]);

  return (
    <Animated.View style={[style, {
      opacity: progress,
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
    }]}>
      {children}
    </Animated.View>
  );
}

function WeatherButton({ title, onPress, styles, disabled = false, selected, style }: {
  title: string;
  onPress: () => void;
  styles: WeatherStyles;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isToggle = selected !== undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, ...(isToggle ? { selected } : {}) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, isToggle && styles.secondaryButton,
        selected && styles.selectedButton, style, pressed && styles.pressedButton, disabled && styles.disabled]}
    >
      <Text style={[styles.buttonText, isToggle && styles.secondaryButtonText, selected && styles.selectedButtonText]}>
        {title}
      </Text>
    </Pressable>
  );
}

function WeatherDetail({ icon, label, value, styles }: {
  icon: string; label: string; value: string; styles: WeatherStyles;
}) {
  return (
    <View style={styles.detail}>
      <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function WeatherScreen({
  weather = null, forecast = [], loading = false, error = "",
}: WeatherScreenProps) {
  const systemTheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);
  const isDarkMode = themeOverride ?? systemTheme === "dark";
  const styles = useMemo(() => createWeatherStyles(isDarkMode, width <= 600), [isDarkMode, width]);
  const colors = weatherThemes[isDarkMode ? "dark" : "light"];
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [units, setUnits] = useState<Units>("metric");
  const [forecastDays, setForecastDays] = useState<3 | 5>(3);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [inputError, setInputError] = useState("");
  const [notice, setNotice] = useState("");
  const visibleError = inputError || error;
  // Keep any supplied result's labels consistent with its data when a unit
  // preference is changed before weather integration is available.
  const displayUnits = weather?.units ?? units;
  const temperatureUnit = displayUnits === "metric" ? "°C" : "°F";
  const windUnit = displayUnits === "metric" ? "m/s" : "mph";

  const showSearchUnavailable = () => {
    Keyboard.dismiss();
    setInputError("");
    setNotice("Weather search is not available yet.");
  };

  const searchByCity = () => {
    if (loading) return;
    setNotice("");
    if (!city.trim()) { setInputError("Please enter a city."); return; }
    showSearchUnavailable();
  };

  const searchByCoordinates = () => {
    if (loading) return;
    setNotice("");
    // Validate native text inputs locally; the shared utilities move in step 4.
    const latitude = Number(lat);
    const longitude = Number(lon);
    if (!lat.trim() || !lon.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setInputError("Enter a latitude between -90 and 90 and a longitude between -180 and 180.");
      return;
    }
    showSearchUnavailable();
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => setInputError("Unable to open this link on your device."));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={styles.container}>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>Weather App</Text>
              <Text style={styles.subtitle}>Check the current weather anywhere in the world.</Text>
              <View style={styles.themeControl}>
                <Text style={styles.themeLabel}>Dark mode</Text>
                <Switch accessibilityLabel="Dark mode" value={isDarkMode} onValueChange={setThemeOverride} trackColor={{ true: colors.accent }} />
              </View>
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.label}>Search by city</Text>
              <View style={styles.inputRow}>
                <TextInput
                  accessibilityLabel="City" placeholder="e.g. Montreal" placeholderTextColor={colors.faint}
                  value={city} onChangeText={setCity} editable={!loading} autoCorrect={false}
                  returnKeyType="search" onSubmitEditing={searchByCity}
                  onFocus={() => setFocusedField("city")} onBlur={() => setFocusedField(null)}
                  style={[styles.input, focusedField === "city" && styles.focusedInput]}
                />
                <WeatherButton title="Search city" onPress={searchByCity} styles={styles} disabled={loading} />
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.label}>Search by coordinates</Text>
              <View style={styles.coordinateInputs}>
                <TextInput
                  accessibilityLabel="Latitude" placeholder="Latitude" placeholderTextColor={colors.faint}
                  value={lat} onChangeText={setLat} editable={!loading} keyboardType="numbers-and-punctuation"
                  autoCorrect={false} autoCapitalize="none"
                  onFocus={() => setFocusedField("lat")} onBlur={() => setFocusedField(null)}
                  style={[styles.input, styles.coordinateInput, focusedField === "lat" && styles.focusedInput]}
                />
                <TextInput
                  accessibilityLabel="Longitude" placeholder="Longitude" placeholderTextColor={colors.faint}
                  value={lon} onChangeText={setLon} editable={!loading} keyboardType="numbers-and-punctuation"
                  autoCorrect={false} autoCapitalize="none" returnKeyType="search" onSubmitEditing={searchByCoordinates}
                  onFocus={() => setFocusedField("lon")} onBlur={() => setFocusedField(null)}
                  style={[styles.input, styles.coordinateInput, focusedField === "lon" && styles.focusedInput]}
                />
                <WeatherButton title="Search coordinates" onPress={searchByCoordinates} styles={styles} style={styles.coordinateButton} disabled={loading} />
              </View>

              {/* The native map and its dependency are deliberately deferred. */}
              <View style={styles.mapPlaceholder}>
                <Text style={styles.label}>Location map</Text>
                <Text style={styles.placeholderText}>Map preview is not available yet.</Text>
              </View>
              <View style={styles.controls}>
                <Text style={styles.label}>Units:</Text>
                <WeatherButton title="Metric" onPress={() => setUnits("metric")} selected={units === "metric"} styles={styles} disabled={loading} />
                <WeatherButton title="Imperial" onPress={() => setUnits("imperial")} selected={units === "imperial"} styles={styles} disabled={loading} />
              </View>
            </View>

            {loading && (
              <View style={styles.loading} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.message}>Loading weather…</Text>
              </View>
            )}
            {Boolean(visibleError) && <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>{visibleError}</Text>}
            {Boolean(notice) && !visibleError && <Text accessibilityLiveRegion="polite" style={styles.message}>{notice}</Text>}

            {weather && !loading && (
              <FadeIn style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  <View style={styles.weatherHeading}>
                    <Text accessibilityRole="header" style={styles.heading}>{weather.location}</Text>
                    <Text style={styles.localTime}>{weather.localDateTime}</Text>
                    <Text style={styles.description}>{weather.description}</Text>
                  </View>
                  {weather.iconUrl && <Image source={{ uri: weather.iconUrl }} accessibilityLabel={weather.description} style={styles.weatherIcon} />}
                </View>
                <Text style={styles.temperature}>{Math.round(weather.temperature)}{temperatureUnit}</Text>
                <Text style={styles.feelsLike}>Feels like {Math.round(weather.feelsLike)}{temperatureUnit}</Text>
                <View style={styles.details}>
                  <WeatherDetail icon="💧" label="Humidity" value={`${weather.humidity}%`} styles={styles} />
                  <WeatherDetail icon="💨" label="Wind" value={`${Math.round(weather.windSpeed)} ${windUnit}`} styles={styles} />
                  <WeatherDetail icon="🌡️" label="Pressure" value={`${weather.pressure} hPa`} styles={styles} />
                  <WeatherDetail icon="👁️" label="Visibility" value={`${weather.visibilityKm.toFixed(1)} km`} styles={styles} />
                </View>

                {forecast.length > 0 && (
                  <View style={styles.forecastSection}>
                    <View style={styles.forecastHeader}>
                      <Text accessibilityRole="header" style={styles.forecastHeading}>Forecast</Text>
                      <View style={styles.forecastToggle} accessibilityLabel="Forecast duration">
                        {([3, 5] as const).map((days) => (
                          <WeatherButton key={days} title={`${days}-Day`} onPress={() => setForecastDays(days)} selected={forecastDays === days} styles={styles} />
                        ))}
                      </View>
                    </View>
                    <View style={styles.forecastGrid}>
                      {forecast.slice(0, forecastDays).map((day, index) => (
                        <FadeIn key={day.date} style={styles.forecastDay} delay={index * 45}>
                          <Text style={styles.forecastDate}>{day.label}</Text>
                          {day.iconUrl && <Image source={{ uri: day.iconUrl }} accessibilityLabel={day.description} style={styles.forecastIcon} />}
                          <Text style={styles.forecastDescription}>{day.description}</Text>
                          <View style={styles.forecastTemperatures}>
                            <View style={styles.forecastTemperature}>
                              <Text style={styles.forecastTemperatureLabel}>High</Text>
                              <Text style={styles.forecastTemperatureValue}>{Math.round(day.high)}{temperatureUnit}</Text>
                            </View>
                            <View style={styles.forecastTemperature}>
                              <Text style={styles.forecastTemperatureLabel}>Low</Text>
                              <Text style={styles.forecastTemperatureValue}>{Math.round(day.low)}{temperatureUnit}</Text>
                            </View>
                          </View>
                        </FadeIn>
                      ))}
                    </View>
                  </View>
                )}
              </FadeIn>
            )}

            {!weather && !loading && !visibleError && (
              <View style={styles.emptyState}>
                <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.emptyIcon}>🌤️</Text>
                <Text accessibilityRole="header" style={styles.emptyHeading}>Search for a location</Text>
                <Text style={styles.placeholderText}>Enter a city or coordinates to see the current weather.</Text>
              </View>
            )}
            <View style={styles.footer}>
              <Text style={styles.copyright}>© {new Date().getFullYear()} Andrey Gonzalez</Text>
              <View style={styles.footerLinks}>
                {[
                  ["GitHub", "https://github.com/KNors22/weather-mobile-app"],
                  ["OpenWeather", "https://openweathermap.org/"],
                  ["OpenStreetMap", "https://www.openstreetmap.org/copyright"],
                ].map(([label, url]) => (
                  <Pressable key={label} accessibilityRole="link" onPress={() => openLink(url)} style={({ pressed }) => [styles.footerLink, pressed && styles.pressedButton]}>
                    <Text style={styles.linkText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
