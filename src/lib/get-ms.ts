import { IntervalMap, Interval } from "../constants";

export function getMs({
  interval,
  unit = 1
}: {
  interval: Interval;
  unit?: number;
}) {
  const intervalValue = IntervalMap[interval];
  let ms = 1000;

  if (intervalValue >= IntervalMap[Interval.MINUTES]) {
    ms *= 60;
  }

  if (intervalValue >= IntervalMap[Interval.HOURS]) {
    ms *= 60;
  }

  if (intervalValue >= IntervalMap[Interval.DAYS]) {
    ms *= 24;
  }

  ms *= unit;

  return ms;
}