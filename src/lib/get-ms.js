import { MINUTES, HOURS, DAYS, INTERVALS } from "../constants";

export function getMs({ interval, unit = 1 }) {
  const intervalValue = INTERVALS[interval];
  let ms = 1000;

  if (intervalValue >= INTERVALS[MINUTES]) {
    ms *= 60;
  }

  if (intervalValue >= INTERVALS[HOURS]) {
    ms *= 60;
  }

  if (intervalValue >= INTERVALS[DAYS]) {
    ms *= 24;
  }

  ms *= unit;

  return ms;
}
