# Weather Mobile App

A mobile adaptation of an existing React weather application, built with React Native and Expo. The goal is to make checking the weather convenient on a phone through a clear interface, touch-friendly controls, and location-based weather lookup.

## Project Status

The native weather screen is connected to the OpenWeather API, the migrated forecast and location utilities, a native map, foreground geolocation, and persistent theme storage. Device testing is still required before release.

## Features

- Search for weather by city.
- Search by latitude and longitude, or tap the native map to select coordinates.
- Display current weather conditions, feels-like temperature, humidity, wind, pressure, and visibility.
- Switch between metric and imperial units and view a three-day or five-day forecast.
- Display the searched location's local date and time.
- Switch between light and dark themes, with the selection saved on the device.
- Use device geolocation to retrieve weather for the user's current location.
- Provide loading indicators and helpful messages for invalid searches, unavailable weather data, and network failures.
- Support manual city search when location permission is denied or location services are unavailable.

## Mobile Design and Device Features

Geolocation uses Expo Location to check nearby weather without typing a city name. Foreground permission is requested only when the user selects **Use my current location**. Denied permission and disabled location services produce an explanation; city and coordinate search remain available.

- Request location permission when the user chooses to use their current location.
- Explain why location access is needed and handle permission denial gracefully.
- Adapt layouts to phone screens and account for safe areas and the on-screen keyboard.
- Use readable text, accessible labels, and comfortably sized touch targets.
- Test the main weather lookup flow on a mobile device or emulator.

## Technologies

- React Native for the mobile interface.
- Expo for the development workflow and device testing.
- Expo Location for foreground geolocation.
- React Native Maps for native map selection.
- AsyncStorage for theme persistence and React Native Safe Area Context for device insets.
- Weather API provider: OpenWeatherMap

## Getting Started

### Prerequisites

- Node.js 22.13 or newer and npm (Expo SDK 57).
- Git.
- A compatible version of Expo Go on a physical device, or a configured Android emulator or iOS simulator.
- OpenWeatherMap API key.

### Installation

1. Clone the repository and open the project folder:

   ```bash
   git clone https://github.com/KNors22/weather-mobile-app.git
   cd weather-mobile-app
   ```

2. Install the project dependencies:

   ```bash
   npm ci
   ```

3. Create a local environment file in `weather-mobile-app/`:

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_OPENWEATHER_API_KEY` to your OpenWeatherMap API key. Expo includes public environment variables in the application bundle, so this key is not a server-side secret. Restart Expo after changing configuration.

4. Start the Expo development server:

   ```bash
   npm start
   ```

5. Open the project in Expo Go using the terminal QR code, or launch it in a configured emulator or simulator. For physical-device testing over a local connection, connect the phone and computer to the same Wi-Fi network.

   Use `npm run android` or `npm run ios` to start Expo and open a configured emulator or simulator. On physical iOS devices, sign in to Expo CLI and Expo Go with the same account if prompted.

The native map works in a compatible Expo Go version. For a standalone Android build, set `GOOGLE_MAPS_ANDROID_API_KEY` in your local or build environment. `app.config.ts` passes it to the native map config plugin. Enable the Maps SDK for Android and restrict the key to your app's Android package and signing certificate; see the [Expo map setup guide](https://docs.expo.dev/versions/v57.0.0/sdk/map-view/). Configure your own Android package and iOS bundle identifier before creating release builds. iOS uses Apple Maps by default.

`npm run web` supports city and coordinate search with a map fallback; the interactive map is available on Android and iOS. Browser location access may require HTTPS or localhost and the browser's permission.

The icon, adaptive-icon, splash, and favicon paths already configured in `app.json` still need their image files. Expo Doctor currently reports missing launcher-icon assets; add the artwork before creating release builds.

## Usage

1. Open the application.
2. Enter a city to retrieve its current weather, or choose the current-location option.
3. If using the current-location option, grant location permission when prompted.
4. Review the weather information. If location access is unavailable, search for a city manually.
5. Select metric or imperial units and choose a three-day or five-day forecast. Tap the map and select **Search coordinates** to look up another location.

## Project Structure

Current repository contents:

```text
weather-mobile-app/
├── .env.example
├── .gitignore
├── app.json
├── app.config.ts
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.js
├── assets/images/
├── tests/
└── src/
    ├── app/              # Expo Router entry and layout
    ├── screens/          # Native weather interface
    ├── styles/           # Theme palettes and responsive native styles
    ├── components/       # Native map and browser fallback
    ├── hooks/            # Weather state and persistent theme
    ├── services/         # OpenWeather requests and device location
    ├── types/            # API and display types
    └── utils/            # Coordinates, timezone formatting, and forecasts
```

## Development Notes

- **Original project:** [React Weather App](https://github.com/KNors22/my-weather-app). City and coordinate lookup, current conditions, forecasts, units, themes, and local time are carried over.
- **Entry point:** `expo-router/entry` starts the application. `src/app/index.tsx` renders the weather screen, and `_layout.tsx` configures navigation.
- **Native interface:** HTML and CSS are replaced with React Native components and `StyleSheet`. The screen scrolls, respects safe areas, accommodates the keyboard, and uses accessible labels and touch targets.
- **Platform APIs:** Leaflet is replaced with React Native Maps, browser storage with AsyncStorage, and browser links with `Linking`. Weather icons are loaded remotely from OpenWeather.
- **Request handling:** Weather actions are locked while a lookup is running. A failed refresh retains the previous result and its unit system.
- **Failure handling:** Weather requests time out after 15 seconds and GPS lookup after 20 seconds. Denied location access leaves manual search available. Theme loading falls back to the system appearance if local storage is unavailable.
- **Testing:** `npm test` runs 19 regression tests using Node's built-in test runner and TypeScript stripping. They cover API requests, errors and timeouts, coordinates, daily forecasts, timezone formatting, and location permission/service/GPS failures. A live city search and forecast have also been verified. Before submission, test on a physical device or simulator and record results for map selection, GPS access, permission prompts, theme persistence, keyboard behavior, and network failures.

Run the checks from the project root:

```bash
npm run lint
npx tsc --noEmit
npm test
npx expo install --check
npx expo export --platform android --platform ios
```

## GitHub Repository

[Weather Mobile App on GitHub](https://github.com/KNors22/weather-mobile-app)


## Author and Acknowledgements

- Author: Andrey Gonzalez
- Instructor: Martin Lee, Circuit Stream

## License

This project is licensed under the MIT License. See the LICENSE file for details.
