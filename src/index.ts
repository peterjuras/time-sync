import { Timers, getCurrentTime } from "./timers";
import { Interval } from "./constants";
import { Countdowns, getTimeLeft } from "./countdowns";

export default class TimeSync {
  public static SECONDS = Interval.SECONDS;
  public static MINUTES = Interval.MINUTES;
  public static HOURS = Interval.HOURS;
  public static DAYS = Interval.DAYS;

  public static getCurrentTime = getCurrentTime;

  public static getTimeLeft = getTimeLeft;

  public addTimer: typeof Timers.prototype.addTimer;
  public removeAllTimers: typeof Timers.prototype.removeAllTimers;

  public createCountdown: typeof Countdowns.prototype.createCountdown;
  public stopAllCountdowns: typeof Countdowns.prototype.stopAllCountdowns;

  public revalidate: () => void;

  public getCurrentTime: typeof getCurrentTime;
  public getTimeLeft: typeof getTimeLeft;

  public constructor() {
    const timers = new Timers();
    const countdowns = new Countdowns();

    this.addTimer = timers.addTimer;
    this.removeAllTimers = timers.removeAllTimers;

    this.createCountdown = countdowns.createCountdown;
    this.stopAllCountdowns = countdowns.stopAllCountdowns;

    this.revalidate = () => {
      timers.revalidateAllTimers();
      countdowns.revalidateAllCountdowns();
    };

    this.getCurrentTime = getCurrentTime;
    this.getTimeLeft = getTimeLeft;
  }
}
