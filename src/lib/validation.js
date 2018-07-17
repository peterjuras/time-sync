import { INTERVALS } from "../constants";

export function validateInterval(config) {
  if (
    typeof config.interval !== "undefined" &&
    !Object.keys(INTERVALS).some(interval => interval === config.interval)
  ) {
    throw new Error(
      "interval must be one of TimeSync.SECONDS, TimeSync.MINUTES, TimeSync.HOURS or TimeSync.DAYS"
    );
  }
}
