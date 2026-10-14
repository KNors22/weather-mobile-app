# Weather Mobile App

A mobile adaptation of an existing React weather application, built with React Native and Expo. The goal is to make checking the weather convenient on a phone through a clear interface, touch-friendly controls, and location-based weather lookup.

Transform an existing project into a mobile application using React Native. Adapt its functionality and interface for mobile devices, follow mobile-specific development guidelines, and integrate a mobile feature such as push notifications, geolocation, or camera access.

## Project Status

This repository currently contains the project documentation and license. The mobile application source code, assets, and configuration have not been added yet. The features and design decisions below describe the intended implementation; they should be updated as development progresses.


## Features

- Search for weather by city.
- Display current weather conditions, including temperature and a weather summary.
- Use device geolocation to retrieve weather for the user's current location.
- Provide loading indicators and helpful messages for invalid searches, unavailable weather data, and network failures.
- Support manual city search when location permission is denied or location services are unavailable.

## Mobile Design and Device Features

Geolocation is the planned mobile-specific integration because it allows users to check nearby weather without typing a city name.

- Request location permission when the user chooses to use their current location.
- Explain why location access is needed and handle permission denial gracefully.
- Adapt layouts to phone screens and account for safe areas and the on-screen keyboard.
- Use readable text, accessible labels, and comfortably sized touch targets.
- Test the main weather lookup flow on a mobile device or emulator.

## Technologies

- React Native for the mobile interface.
- Expo for the development workflow and device testing.
- Expo Location for the planned geolocation feature.
- Weather API provider: OpenWeatherMap

## Getting Started

### Prerequisites

- Node.js LTS and npm.
- Git.
- A compatible version of Expo Go on a physical device, or a configured Android emulator or iOS simulator.
- OpenWeatherMap API key.

### Installation

The following steps apply once the Expo application files and `package.json` have been added to this repository.

1. Clone the repository and open the project folder:

   ```bash
   git clone https://github.com/KNors22/weather-mobile-app.git
   cd weather-mobile-app
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Configure the weather API using the provider-specific instructions that will be added here. Document the required environment variable names in an `.env.example` file without including real credentials.

4. Start the Expo development server:

   ```bash
   npx expo start
   ```

5. Open the project in Expo Go using the terminal QR code, or launch it in a configured emulator or simulator. For physical-device testing over a local connection, connect the phone and computer to the same Wi-Fi network.

## Usage

Intended workflow after implementation:

1. Open the application.
2. Enter a city to retrieve its current weather, or choose the current-location option.
3. If using the current-location option, grant location permission when prompted.
4. Review the weather information. If location access is unavailable, search for a city manually.

## Project Structure

Current repository contents:

```text
weather-mobile-app/
├── .env
├── .gitignore
├── CHANGELOG.md
├── LICENSE
└── README.md
```

Update this section when the application source, assets, and Expo configuration are added.

## Development Notes

- **Original project:** Existing React weather application. Add its repository link and identify the functionality carried over to the mobile version.
- **Migration approach:** Reuse suitable weather request logic, validation, and state management. Adapt browser-dependent code and rebuild the interface with React Native components.
- **Design decisions:** Prioritize quick weather lookup and use geolocation to reduce typing on mobile devices.
- **Challenges to document:** Differences between web and native styling, location permission handling, API failures, and keyboard behavior on small screens. Record the actual issues encountered and their solutions during implementation.
- **Testing:** No application testing has been performed in this repository yet. Before submission, document the devices or simulators used and the results of city search, current-location lookup, permission denial, and network-error checks.

## GitHub Repository

[Weather Mobile App on GitHub](https://github.com/KNors22/weather-mobile-app)


## Author and Acknowledgements

- Author: Andrey Gonzalez
- Instructor: Martin Lee, Circuit Stream

## License

This project is licensed under the MIT License. See the LICENSE file for details.
