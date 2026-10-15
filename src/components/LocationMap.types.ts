import type { Coordinates } from "../types/weather";

export type LocationMapProps = {
  position: Coordinates | null;
  locationName: string;
  onSelect: (latitude: number, longitude: number) => void;
  disabled?: boolean;
  dark: boolean;
};
