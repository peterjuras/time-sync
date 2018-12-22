// Intervals
export enum Interval {
  SECONDS = "s",
  MINUTES = "m",
  HOURS = "h",
  DAYS = "d"
}

export const IntervalMap = {
  [Interval.SECONDS]: 1,
  [Interval.MINUTES]: 2,
  [Interval.HOURS]: 3,
  [Interval.DAYS]: 4
};
