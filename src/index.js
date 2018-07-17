import { Timers, getCurrentTime } from "./timers";
import { SECONDS, MINUTES, HOURS, DAYS } from "./constants";
import { Countdowns, getTimeLeft } from "./countdowns";

export default class TimeSync {
  static SECONDS = SECONDS;

  static MINUTES = MINUTES;

  static HOURS = HOURS;

  static DAYS = DAYS;

  static getCurrentTime = getCurrentTime;

  static getTimeLeft = getTimeLeft;

  constructor() {
    const timers = new Timers();
    const countdowns = new Countdowns();

    this.addTimer = timers.addTimer;
    this.revalidate = timers.revalidate;
    this.removeAllTimers = timers.removeAllTimers;

    this.createCountdown = countdowns.createCountdown;
    this.stopAllCountdowns = countdowns.stopAllCountdowns;

    this.getCurrentTime = getCurrentTime;
    this.getTimeLeft = getTimeLeft;
  }
}
