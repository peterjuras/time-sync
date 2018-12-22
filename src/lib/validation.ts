import { Interval, IntervalMap } from "../constants";

export function validateInterval(config: { interval?: Interval }) {
  if (
    typeof config.interval !== "undefined" &&
    !Object.keys(IntervalMap).some(interval => interval === config.interval)
  ) {
    throw new Error(
      "interval must be one of TimeSync.SECONDS, TimeSync.MINUTES, TimeSync.HOURS or TimeSync.DAYS"
    );
  }
}
