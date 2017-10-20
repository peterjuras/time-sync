import { generate } from 'shortid';

// Intervals
const SECONDS = 's';
const MINUTES = 'm';
const HOURS = 'h';
const DAYS = 'd';
const INTERVALS = {
  [SECONDS]: 1,
  [MINUTES]: 2,
  [HOURS]: 3,
  [DAYS]: 4
};

const DEFAULT_TIMER_CONFIG = {
  interval: SECONDS,
  unit: 1
};


function validateAddTimerArgs(callback, timerConfig) {
  if (!callback) {
    throw new Error('You need to provide a callback as the first argument to addTimer');
  }

  if (
    typeof timerConfig.interval !== 'undefined' &&
    !Object.keys(INTERVALS).some(interval => interval === timerConfig.interval)
  ) {
    throw new Error('interval must be one of TimeSync.SECONDS, TimeSync.MINUTES, TimeSync.HOURS or TimeSync.DAYS');
  }

  if (
    typeof timerConfig.unit !== 'undefined' &&
    (!Number.isInteger(timerConfig.unit) ||
    timerConfig.unit <= 0)
  ) {
    throw new Error('unit must be a positive integer');
  }
}

class TimeSyncPrivate {
  timers = {};

  currentTimeout;
  lastTime;
  nextTick;
  nextTimers = [];

  onTick = () => {
    this.lastTime = Date.now();

    this.nextTimers.forEach((timer) => {
      timer.callback(this.lastTime);
    });

    this.calculateNextTimers();
  }

  getNextTick = ({ interval, unit }) => {
    let ms = 1000;

    if (INTERVALS[interval] >= INTERVALS[MINUTES]) {
      ms *= 60;
    }

    if (INTERVALS[interval] >= INTERVALS[HOURS]) {
      ms *= 60;
    }

    if (INTERVALS[interval] >= INTERVALS[DAYS]) {
      ms *= 24;
    }

    ms *= unit;

    const newTime = this.getLastTime() + ms;
    const newTick = newTime - (newTime % ms);

    return newTick;
  }

  calculateNextTimers = () => {
    // Reset the next timers
    this.nextTimers = [];
    clearTimeout(this.currentTimeout);

    // Check whether any timers are left
    const timerIds = Object.keys(this.timers);

    // Calculate the next timers
    const now = Date.now();
    const {
      newNextTick,
      newTimers
    } = timerIds.reduce((map, timerId) => {
      const timer = this.timers[timerId];
      const timerTick = this.getNextTick(timer);

      if (!map.newNextTick || map.newNextTick > timerTick) {
        return {
          newTimers: [timer],
          newNextTick: timerTick
        };
      } else if (map.newNextTick === timerTick || timerTick <= now) {
        map.newTimers.push(timer);
      }

      return map;
    }, {});

    this.nextTimers = newTimers || [];

    this.nextTick = newNextTick;

    if (newNextTick) {
      const nextTickDelta = Math.max(this.nextTick - now, 0);
      this.currentTimeout = setTimeout(this.onTick, nextTickDelta);
    } else {
      this.lastTime = null;
    }
  };

  checkForNextTick = (newTimer) => {
    const newTimerNextTick = this.getNextTick(newTimer);

    if (!this.nextTick || newTimerNextTick < this.nextTick) {
      clearTimeout(this.currentTimeout);

      this.nextTick = newTimerNextTick;
      const nextTickDelta = this.nextTick - Date.now();

      this.currentTimeout = setTimeout(this.onTick, nextTickDelta);
      this.nextTimers = [newTimer];
    } else if (newTimerNextTick === this.nextTick) {
      this.nextTimers.push(newTimer);
    }
  }

  revalidate = () => {
    this.calculateNextTimers();
  };

  removeTimer = (id) => {
    let timerIndex = null;
    this.nextTimers.some((timer, index) => {
      if (timer.id === id) {
        timerIndex = index;
        return true;
      }
      return false;
    });

    delete this.timers[id];

    if (timerIndex !== null) {
      // Check if timer is the only timer that is being called on the next tick
      if (this.nextTimers.length > 1) {
        // There are other timers that will be called on the next tick.
        // We only need to remove the current timer
        this.nextTimers.splice(timerIndex, 1);
      } else {
        // There are no other timers, therefore we can calculate the next
        // called timers from the remaining timers.
        this.calculateNextTimers();
      }
    }
  }

  removeAllTimers = () => {
    clearTimeout(this.currentTimeout);
    this.timers = {};
    this.nextTimers = [];
    this.nextTick = null;
    this.lastTime = null;
  };


  addTimer = (callback, timerConfig = {}) => {
    validateAddTimerArgs(callback, timerConfig);

    const id = generate();
    const newTimer = {
      ...DEFAULT_TIMER_CONFIG,
      ...timerConfig,
      callback,
      id
    };

    this.timers[id] = newTimer;
    this.checkForNextTick(newTimer);
    return () => this.removeTimer(id);
  }

  getLastTime = () => {
    if (!this.lastTime) {
      this.lastTime = Date.now();
    }
    return this.lastTime;
  }
}

export default class TimeSync {
  static SECONDS = SECONDS;
  static MINUTES = MINUTES;
  static HOURS = HOURS;
  static DAYS = DAYS;

  constructor() {
    const instance = new TimeSyncPrivate();

    this.addTimer = instance.addTimer;
    this.getLastTime = instance.getLastTime;
    this.revalidate = instance.revalidate;
    this.removeAllTimers = instance.removeAllTimers;
  }
}
