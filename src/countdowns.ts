import { Interval, IntervalMap } from "./constants";
import { validateInterval } from "./lib/validation";
import { generateId } from "./lib/id";
import { getMs } from "./lib/get-ms";

const DEFAULT_COUNTDOWN_CONFIG = {
  interval: Interval.SECONDS
};

interface CountdownConfig {
  until: number;
  interval?: Interval;
}

interface SafeCountdownConfig extends CountdownConfig {
  interval: Interval;
}

type CountdownCallback = (timeLeft: number) => void;

interface CountdownStoredConfig extends SafeCountdownConfig {
  id: number;
  callback: CountdownCallback;
  ms: number;
  timeout?: number;
}

function validateCountdownConfig(countdownConfig: CountdownConfig): void {
  if (!countdownConfig) {
    throw new Error("You must pass a valid countdown configuration object");
  }

  validateInterval(countdownConfig.interval);

  if (!Number.isInteger(countdownConfig.until)) {
    throw new Error("until must be an integer");
  }
}

function convert(difference: number, interval: Interval): number {
  const intervalValue = IntervalMap[interval];
  let result = difference / 1000;

  if (intervalValue >= IntervalMap[Interval.MINUTES]) {
    result /= 60;
  }

  if (intervalValue >= IntervalMap[Interval.HOURS]) {
    result /= 60;
  }

  if (intervalValue >= IntervalMap[Interval.DAYS]) {
    result /= 24;
  }

  return result;
}

function calculateTimeLeft(config: SafeCountdownConfig): number {
  // until is timestamp in milliseconds that should be reached
  const difference = config.until - Date.now();

  // Convert the difference to the specified interval
  const timeLeft = Math.ceil(convert(difference, config.interval));

  return timeLeft > 0 ? timeLeft : 0;
}

export function getTimeLeft(countdownConfig: CountdownConfig): number {
  validateCountdownConfig(countdownConfig);

  const config = {
    ...DEFAULT_COUNTDOWN_CONFIG,
    ...countdownConfig
  };

  return calculateTimeLeft(config);
}

function getNextTickDelta(
  { ms, until }: CountdownStoredConfig,
  time: number
): number {
  const timeMod = time % ms;
  const untilMod = until % ms;

  if (timeMod === untilMod) {
    return ms;
  }
  if (timeMod < untilMod) {
    return untilMod - timeMod;
  }
  return untilMod + ms - timeMod;
}

function validateCreateCountdownArgs(
  callback: CountdownCallback,
  countdownConfig: CountdownConfig
): void {
  if (!callback) {
    throw new Error(
      "You need to provide a callback as the first argument to createCountdown"
    );
  }

  validateCountdownConfig(countdownConfig);
}

export class Countdowns {
  private countdowns: {
    [key: string]: CountdownStoredConfig;
  } = {};

  public createCountdown = (
    callback: CountdownCallback,
    countdownConfig: CountdownConfig
  ) => {
    validateCreateCountdownArgs(callback, countdownConfig);

    const id = generateId();
    const countdownBase = {
      ...DEFAULT_COUNTDOWN_CONFIG,
      ...countdownConfig
    };
    const newCountdown: CountdownStoredConfig = {
      ...countdownBase,
      callback,
      id,
      ms: getMs(countdownBase.interval)
    };

    const now = Date.now();
    const nextTickDelta = getNextTickDelta(newCountdown, now);
    if (newCountdown.until <= now) {
      throw new Error(
        "until property needs to be in the future. Please ensure you are using a millisecond timestamp!"
      );
    }

    newCountdown.timeout = setTimeout(
      this.revalidate,
      nextTickDelta,
      newCountdown
    );

    this.countdowns[id] = newCountdown;

    return () => this.removeCountdown(id);
  };

  public stopAllCountdowns = () => {
    Object.keys(this.countdowns).forEach((id: string) => {
      clearTimeout(this.countdowns[id].timeout);
    });
    this.countdowns = {};
  };

  private revalidate = (countdown: CountdownStoredConfig) => {
    clearTimeout(countdown.timeout);

    const timeLeft = calculateTimeLeft(countdown);
    countdown.callback(timeLeft);

    if (timeLeft > 0) {
      const nextTickDelta = getNextTickDelta(countdown, Date.now());

      countdown.timeout = setTimeout(this.revalidate, nextTickDelta, countdown);
    } else {
      this.removeCountdown(countdown.id);
    }
  };

  private removeCountdown = (id: number) => {
    const countdown = this.countdowns[id];
    if (!countdown) {
      return;
    }

    clearTimeout(countdown.timeout);
    delete this.countdowns[id];
  };
}
