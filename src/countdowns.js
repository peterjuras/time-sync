import { SECONDS, MINUTES, HOURS, DAYS, INTERVALS } from "./constants";
import { validateInterval } from "./lib/validation";
import { generateId } from "./lib/id";
import { getMs } from "./lib/get-ms";

const DEFAULT_COUNTDOWN_CONFIG = {
  interval: SECONDS
};

function validateCountdownConfig(countdownConfig) {
  if (!countdownConfig) {
    throw new Error("You must pass a valid countdown configuration object");
  }

  validateInterval(countdownConfig);

  if (!Number.isInteger(countdownConfig.until)) {
    throw new Error("until must be an integer");
  }
}

function convert(difference, interval) {
  const intervalValue = INTERVALS[interval];
  let result = difference / 1000;

  if (intervalValue >= INTERVALS[MINUTES]) {
    result /= 60;
  }

  if (intervalValue >= INTERVALS[HOURS]) {
    result /= 60;
  }

  if (intervalValue >= INTERVALS[DAYS]) {
    result /= 24;
  }

  return result;
}

function calculateTimeLeft(config) {
  // until is timestamp in milliseconds that should be reached
  const difference = config.until - Date.now();

  // Convert the difference to the specified interval
  const timeLeft = Math.ceil(convert(difference, config.interval));

  return timeLeft > 0 ? timeLeft : 0;
}

export function getTimeLeft(countdownConfig) {
  validateCountdownConfig(countdownConfig);

  const config = {
    ...DEFAULT_COUNTDOWN_CONFIG,
    ...countdownConfig
  };

  return calculateTimeLeft(config);
}

function getNextTickDelta({ ms, until }, time) {
  const timeMod = time % ms;
  const untilMod = until % ms;

  if (timeMod === untilMod) {
    return ms;
  }
  if (timeMod > untilMod) {
    return ms - timeMod;
  }
  return untilMod - timeMod;
}

function validateCreateCountdownArgs(callback, countdownConfig) {
  if (!callback) {
    throw new Error(
      "You need to provide a callback as the first argument to createCountdown"
    );
  }

  validateCountdownConfig(countdownConfig);
}

export class Countdowns {
  countdowns = {};

  createCountdown = (callback, countdownConfig) => {
    validateCreateCountdownArgs(callback, countdownConfig);

    const id = generateId();
    const newCountdown = {
      ...DEFAULT_COUNTDOWN_CONFIG,
      ...countdownConfig,
      callback,
      id
    };
    newCountdown.ms = getMs(newCountdown);

    const now = Date.now();
    const nextTickDelta = getNextTickDelta(newCountdown, now);
    if (newCountdown.until <= now) {
      throw new Error(
        "until property needs to be in the future. Please ensure you are using a millisecond timestamp!"
      );
    }
    // const nextTickDelta = nextTick - now;

    // eslint-disable-next-line no-param-reassign
    newCountdown.timeout = setTimeout(
      this.revalidate,
      nextTickDelta,
      // nextTick,
      newCountdown
    );

    this.countdowns[id] = newCountdown;

    return () => this.removeCountdown(id);
  };

  revalidate = countdown => {
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

  removeCountdown = id => {
    const countdown = this.countdowns[id];
    if (!countdown) {
      return;
    }

    clearTimeout(countdown.timeout);
    delete this.countdowns[id];
  };

  stopAllCountdowns = () => {
    Object.keys(this.countdowns).forEach(id => {
      clearTimeout(this.countdowns[id].timeout);
    });
    this.countdowns = {};
  };
}
