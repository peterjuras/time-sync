import { SECONDS } from "./constants";
import { generateId } from "./lib/id";
import { validateInterval } from "./lib/validation";
import { getMs } from "./lib/get-ms";

const DEFAULT_TIMER_CONFIG = {
  interval: SECONDS,
  unit: 1
};

function validateTimerConfig(timerConfig) {
  validateInterval(timerConfig);

  if (
    typeof timerConfig.unit !== "undefined" &&
    (!Number.isInteger(timerConfig.unit) || timerConfig.unit <= 0)
  ) {
    throw new Error("unit must be a positive integer");
  }
}

function validateAddTimerArgs(callback, timerConfig) {
  if (!callback) {
    throw new Error(
      "You need to provide a callback as the first argument to addTimer"
    );
  }

  validateTimerConfig(timerConfig);
}

function roundTick(ms, tick) {
  return tick - (tick % ms);
}

function getCurrentTick(ms) {
  return roundTick(ms, Date.now());
}

function getNextTick({ ms }, time) {
  const newTime = time + ms;
  return roundTick(ms, newTime);
}

function getUnixTimeStamp(tick) {
  return Math.floor(tick / 1000);
}

export function getCurrentTime(timerConfig = {}) {
  validateTimerConfig(timerConfig);

  const config = {
    ...DEFAULT_TIMER_CONFIG,
    ...timerConfig
  };

  return getUnixTimeStamp(getCurrentTick(getMs(config)));
}

export class Timers {
  timers = {};

  currentTimeout;

  nextTick;

  revalidate = () => {
    clearTimeout(this.currentTimeout);
    const now = Date.now();

    this.nextTick = Object.keys(this.timers).reduce((prev, timerId) => {
      const timer = this.timers[timerId];

      if (timer.nextTick <= now) {
        const usedTime = roundTick(timer.ms, now);
        timer.callback(getUnixTimeStamp(usedTime));
        timer.nextTick = getNextTick(timer, now);
      }

      if (!prev || prev > timer.nextTick) {
        return timer.nextTick;
      }
      return prev;
    }, null);

    if (this.nextTick) {
      const nextTickDelta = this.nextTick - Date.now();
      this.currentTimeout = setTimeout(this.revalidate, nextTickDelta);
    }
  };

  removeTimer = id => {
    const timer = this.timers[id];
    if (!timer) {
      return;
    }

    delete this.timers[id];
    if (timer.nextTick === this.nextTick) {
      this.revalidate();
    }
  };

  removeAllTimers = () => {
    this.timers = {};
    this.revalidate();
  };

  addTimer = (callback, timerConfig = {}) => {
    validateAddTimerArgs(callback, timerConfig);

    const id = generateId();
    const newTimer = {
      ...DEFAULT_TIMER_CONFIG,
      ...timerConfig,
      callback,
      id
    };
    newTimer.ms = getMs(newTimer);
    newTimer.nextTick = getNextTick(newTimer, Date.now());

    this.timers[id] = newTimer;

    if (!this.nextTick || newTimer.nextTick < this.nextTick) {
      this.revalidate();
    }

    return () => this.removeTimer(id);
  };
}
