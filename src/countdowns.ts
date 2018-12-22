import { Interval, IntervalMap } from "./constants";
import { validateInterval } from "./lib/validation";
import { generateId } from "./lib/id";
import { getMs } from "./lib/get-ms";

const DEFAULT_COUNTDOWN_CONFIG = {
  interval: Interval.SECONDS
};

interface ICountdownConfig {
  until: number;
  interval?: Interval;
}

interface ISafeCountdownConfig extends ICountdownConfig {
  interval: Interval;
}

type CountdownCallback = (timeLeft: number) => any;

interface ICountdownStoredConfig extends ISafeCountdownConfig {
  id: number;
  callback: CountdownCallback;
  ms: number;
  timeout?: number;
}

function validateCountdownConfig(countdownConfig: ICountdownConfig) {
  if (!countdownConfig) {
    throw new Error("You must pass a valid countdown configuration object");
  }

  validateInterval(countdownConfig);

  if (!Number.isInteger(countdownConfig.until)) {
    throw new Error("until must be an integer");
  }
}

function convert(difference: number, interval: Interval) {
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

function calculateTimeLeft(config: ISafeCountdownConfig) {
  // until is timestamp in milliseconds that should be reached
  const difference = config.until - Date.now();

  // Convert the difference to the specified interval
  const timeLeft = Math.ceil(convert(difference, config.interval));

  return timeLeft > 0 ? timeLeft : 0;
}

export function getTimeLeft(countdownConfig: ICountdownConfig) {
  validateCountdownConfig(countdownConfig);

  const config = {
    ...DEFAULT_COUNTDOWN_CONFIG,
    ...countdownConfig
  };

  return calculateTimeLeft(config);
}

function getNextTickDelta({ ms, until }: ICountdownStoredConfig, time: number) {
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
  countdownConfig: ICountdownConfig
) {
  if (!callback) {
    throw new Error(
      "You need to provide a callback as the first argument to createCountdown"
    );
  }

  validateCountdownConfig(countdownConfig);
}

export class Countdowns {
  private countdowns: {
    [key: string]: ICountdownStoredConfig;
  } = {};

  public createCountdown = (
    callback: CountdownCallback,
    countdownConfig: ICountdownConfig
  ) => {
    validateCreateCountdownArgs(callback, countdownConfig);

    const id = generateId();
    const countdownBase = {
      ...DEFAULT_COUNTDOWN_CONFIG,
      ...countdownConfig
    };
    const newCountdown: ICountdownStoredConfig = {
      ...countdownBase,
      callback,
      id,
      ms: getMs(countdownBase)
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

  private revalidate = (countdown: ICountdownStoredConfig) => {
    clearTimeout(countdown.timeout);

    const timeLeft = calculateTimeLeft(countdown);
    countdown.callback(timeLeft);

    if (timeLeft > 0) {
      // const nextTickDelta = getNextTick(countdown, Date.now()) - Date.now();
      const nextTickDelta = getNextTickDelta(countdown, Date.now());

      // eslint-disable-next-line no-param-reassign
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