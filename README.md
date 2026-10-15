# Weather Mobile App

A mobile adaptation of an existing React weather application, built with React Native and Expo. The goal is to make checking the weather convenient on a phone through a clear interface, touch-friendly controls, and location-based weather lookup.

## Project Status

The project is being migrated from a React web application to a React Native mobile application.

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
   cd weather-mobile-app/react-weather-app
   ```

2. Install the project dependencies:

   ```bash
   npm ci
   ```

3. Create a local environment file in `weather-mobile-app/`:

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_OPENWEATHER_API_KEY` to your OpenWeatherMap API key.

4. Start the Expo development server:

   ```bash
   npm start
   ```

5. Open the project in Expo Go using the terminal QR code, or launch it in a configured emulator or simulator. For physical-device testing over a local connection, connect the phone and computer to the same Wi-Fi network.

   Use `npm run android` or `npm run ios` to start Expo and open a configured emulator or simulator. On physical iOS devices, sign in to Expo CLI and Expo Go with the same account if prompted.

The native map works in Expo Go. A standalone Android build also requires a Google Maps API key and native map configuration; see the [Expo map setup guide](https://docs.expo.dev/versions/latest/sdk/map-view/). iOS uses Apple Maps by default. Browser preview is not configured for this native application.

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
├── .env
├── .gitignore
├── app.json
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── assets/images/
└── src/app/
    └── index.tsx
```

## Development Notes

- **Original project:** [React Weather App](https://github.com/KNors22/my-weather-app). City and coordinate lookup, current conditions, forecasts, units, themes, and local time are carried over.
- **Entry point:** `main.jsx` uses Expo's `registerRootComponent` in place of React DOM's `createRoot`.
- **Native interface:** HTML and CSS are replaced with React Native components and `StyleSheet`. The screen scrolls, respects safe areas, accommodates the keyboard, and uses accessible labels and touch targets.
- **Platform APIs:** Leaflet is replaced with React Native Maps, browser storage with AsyncStorage, and browser links with `Linking`. Weather icons are loaded remotely from OpenWeather.
- **Request handling:** Weather actions are locked while a lookup is running. A failed refresh retains the previous result and its unit system.
- **Testing:** `npm run lint` and `npm test` pass, and Metro exports for both Android and iOS have been verified. Eight tests cover API requests and failures, coordinate validation, daily forecasts, forecast duration, and timezone formatting. Before submission, test on a physical device or simulator and record results for GPS access, permission denial, map selection, theme persistence, keyboard behavior, and network failures.

Run the checks from `react-weather-app/`:

```bash
npm run lint
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