import { Interval, IntervalMap } from "../constants";

export function validateInterval(interval?: Interval): void {
  if (
    typeof interval !== "undefined" &&
    !Object.keys(IntervalMap).some(innerInterval => innerInterval === interval)
  ) {
    throw new Error(
      "interval must be one of TimeSync.SECONDS, TimeSync.MINUTES, TimeSync.HOURS or TimeSync.DAYS"
    );
  }
}
