import { Interval } from "./constants";
import { generateId } from "./lib/id";
import { validateInterval } from "./lib/validation";
import { getMs } from "./lib/get-ms";

const DEFAULT_TIMER_CONFIG: SafeTimerConfig = {
  interval: Interval.SECONDS,
  unit: 1
};

interface TimerConfig {
  interval?: Interval;
  unit?: number;
}

interface SafeTimerConfig extends TimerConfig {
  interval: Interval;
}

type TimeCallback = (currentTime: number) => void;

interface StoredTimerConfig extends SafeTimerConfig {
  id: number;
  callback: TimeCallback;
  ms: number;
  nextTick: number;
}

function validateTimerConfig(timerConfig: TimerConfig): void {
  validateInterval(timerConfig.interval);

  if (
    typeof timerConfig.unit !== "undefined" &&
    (!Number.isInteger(timerConfig.unit) || timerConfig.unit <= 0)
  ) {
    throw new Error("unit must be a positive integer");
  }
}

function validateAddTimerArgs(
  callback: TimeCallback,
  timerConfig: TimerConfig
): void {
  if (!callback) {
    throw new Error(
      "You need to provide a callback as the first argument to addTimer"
    );
  }

  validateTimerConfig(timerConfig);
}

function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset() * 60 * 1000;
}

function roundTick(ms: number, tick: number, interval?: Interval): number {
  let delta = tick % ms;
  if (interval === Interval.DAYS) {
    const timezoneDelta = delta - getTimezoneOffset();
    if (timezoneDelta > ms) {
      return tick + timezoneDelta;
    }
    delta = Math.abs(timezoneDelta);
  }

  return tick - delta;
}

function getCurrentTick(ms: number, interval: Interval): number {
  return roundTick(ms, Date.now(), interval);
}

function getNextTick(interval: Interval, ms: number, time: number): number {
  const newTime = time + ms;
  return roundTick(ms, newTime, interval);
}

function getUnixTimeStamp(tick: number): number {
  return Math.floor(tick / 1000);
}

export function getCurrentTime(timerConfig: TimerConfig = {}): number {
  validateTimerConfig(timerConfig);

  const config: SafeTimerConfig = {
    ...DEFAULT_TIMER_CONFIG,
    ...timerConfig
  };

  return getUnixTimeStamp(
    getCurrentTick(getMs(config.interval, config.unit), config.interval)
  );
}

export class Timers {
  private timers: {
    [key: string]: StoredTimerConfig;
  } = {};

  private currentTimeout?: number;

  private nextTick: number = 0;

  public removeAllTimers = () => {
    this.timers = {};
    this.revalidate();
  };

  public addTimer = (callback: TimeCallback, timerConfig: TimerConfig = {}) => {
    validateAddTimerArgs(callback, timerConfig);

    const id = generateId();
    const newTimerBase = {
      ...DEFAULT_TIMER_CONFIG,
      ...timerConfig
    };
    const ms = getMs(newTimerBase.interval, newTimerBase.unit);
    const newTimer: StoredTimerConfig = {
      ...newTimerBase,
      callback,
      id,
      ms,
      nextTick: getNextTick(newTimerBase.interval, ms, Date.now())
    };

    this.timers[id] = newTimer;

    if (!this.nextTick || newTimer.nextTick < this.nextTick) {
      this.revalidate();
    }

    return () => this.removeTimer(id);
  };

  public revalidate = () => {
    clearTimeout(this.currentTimeout);
    const now = Date.now();

    this.nextTick = Object.keys(this.timers).reduce(
      (prev: number, timerId: string) => {
        const timer = this.timers[timerId];

        if (timer.nextTick <= now) {
          const usedTime = roundTick(timer.ms, now, timer.interval);
          timer.callback(getUnixTimeStamp(usedTime));
          timer.nextTick = getNextTick(timer.interval, timer.ms, now);
        }

        if (!prev || prev > timer.nextTick) {
          return timer.nextTick;
        }
        return prev;
      },
      0
    );

    if (this.nextTick) {
      const nextTickDelta = this.nextTick - Date.now();
      this.currentTimeout = setTimeout(this.revalidate, nextTickDelta);
    }
  };

  private removeTimer = (id: number) => {
    const timer = this.timers[id];
    if (!timer) {
      return;
    }

    delete this.timers[id];
    if (timer.nextTick === this.nextTick) {
      this.revalidate();
    }
  };
}
