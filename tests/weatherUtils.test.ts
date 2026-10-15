import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidLatitude, isValidLongitude } from "../src/utils/location.ts";
import { normalizeForecast, selectForecastDays } from "../src/utils/forecast.ts";
import { formatForecastDate, formatLocationDateTime } from "../src/utils/dateTime.ts";
import type { ForecastReading } from "../src/types/weather.ts";

test("coordinate validation accepts signed decimal input and rejects blank or out-of-range values", () => {
  for (const value of ["-90", "0", "45.5019", "90"]) assert.equal(isValidLatitude(value), true);
  for (const value of ["-180", "0", "-73.5674", "180"]) assert.equal(isValidLongitude(value), true);
  for (const value of ["", " ", null, undefined, "abc", Infinity]) {
    assert.equal(isValidLatitude(value), false);
    assert.equal(isValidLongitude(value), false);
  }
  assert.equal(isValidLatitude("90.1"), false);
  assert.equal(isValidLongitude("-180.1"), false);
});

test("daily forecasts use the searched location's calendar date and extrema", () => {
  const reading = (time: string, min: number, max: number, description: string): ForecastReading => ({
    dt: Date.parse(time) / 1000,
    main: { temp_min: min, temp_max: max },
    weather: [{ icon: "01d", description }],
  });
  const days = normalizeForecast({
    city: { timezone: -4 * 3600 },
    list: [
      reading("2026-10-15T03:00:00Z", 2, 5, "previous day"),
      reading("2026-10-15T12:00:00Z", 6, 9, "morning"),
      reading("2026-10-15T15:00:00Z", 7, 12, "near noon"),
      reading("2026-10-16T03:00:00Z", 4, 8, "evening"),
      reading("2026-10-16T15:00:00Z", 5, 10, "tomorrow"),
    ],
  }, Date.parse("2026-10-15T12:00:00Z"));
  assert.equal(days.length, 2);
  assert.deepEqual({ date: days[0].date, min: days[0].min, max: days[0].max, description: days[0].description, isToday: days[0].isToday }, {
    date: "2026-10-15", min: 4, max: 12, description: "near noon", isToday: true,
  });
  assert.equal(days[1].date, "2026-10-16");
  assert.equal(days[1].isToday, false);
});

test("three-day and five-day selection prefers future dates and uses today when needed", () => {
  const today = { isToday: true, id: -1 };
  const future = Array.from({ length: 5 }, (_, id) => ({ isToday: false, id }));
  assert.deepEqual(selectForecastDays([today, ...future], 3), future.slice(0, 3));
  assert.deepEqual(selectForecastDays([today, ...future], 5), future);
  assert.deepEqual(selectForecastDays([today, ...future.slice(0, 4)], 5), [today, ...future.slice(0, 4)]);
  assert.deepEqual(selectForecastDays(future, 0), []);
  assert.deepEqual(normalizeForecast(), []);
});

test("invalid forecast readings are ignored", () => {
  assert.deepEqual(normalizeForecast({ list: [{ dt: NaN, main: { temp_min: 1, temp_max: 2 } }] }), []);
});

test("location clock handles fractional offsets and date rollover independently of device timezone", () => {
  const text = formatLocationDateTime(Date.parse("2026-10-15T20:00:00Z"), 5.5 * 3600);
  assert.match(text, /1:30a\.m\./);
  assert.match(text, /October 16, 2026/);
  assert.match(text, /GMT\+5:30/);
  assert.equal(formatLocationDateTime(NaN, 0), "");
  assert.match(formatForecastDate("2026-10-15", true), /^Today,/);
});
