import TimeSync from ".";
import { Timers } from "./timers";
import FakeTimers from "@sinonjs/fake-timers";

describe("#timers", () => {
  const instance = new Timers();
  let clock: FakeTimers.InstalledClock;

  beforeEach(() => {
    clock = FakeTimers.install({
      now: 10001,
    });
  });

  afterEach(() => {
    clock.uninstall();
    instance.removeAllTimers();
  });

  describe("#addTimer", () => {
    it("should be exported correctly", () => {
      expect(instance.addTimer).toBeInstanceOf(Function);
    });

    it("should throw if no callback is provided", () => {
      expect(instance.addTimer).toThrowErrorMatchingSnapshot();
    });

    it("should throw if for an unknown interval", () => {
      expect(() =>
        instance.addTimer(jest.fn(), {
          interval: [] as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          interval: {} as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          interval: 123 as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          interval: "" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          interval: "a" as any,
        })
      ).toThrowErrorMatchingSnapshot();
    });

    it("should throw if for an invalid unit", () => {
      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: [] as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: {} as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: "" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: "a" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: "15" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: 250.291,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: 0,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: -12,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.addTimer(jest.fn(), {
          unit: -12.28,
        })
      ).toThrowErrorMatchingSnapshot();
    });

    it("should add a second timer by default", () => {
      const mock = jest.fn();
      instance.addTimer(mock);

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(998);
      expect(mock).toHaveBeenCalledTimes(0);

      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(1);

      clock.tick(999);
      expect(mock).toHaveBeenCalledTimes(1);
    });

    it("should correctly callback for a second timer", () => {
      const mock = jest.fn();
      instance.addTimer(mock, { interval: TimeSync.SECONDS });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(1000 * 2 - 2);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenLastCalledWith(11);
    });

    it("should correctly callback for a minute timer", () => {
      const mock = jest.fn();
      instance.addTimer(mock, { interval: TimeSync.MINUTES });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(60000 * 2 - 2);

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(120);
    });

    it("should correctly callback for a hour timer", () => {
      const mock = jest.fn();
      instance.addTimer(mock, { interval: TimeSync.HOURS });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(1000 * 60 * 60 * 2 - 2);

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(60 * 60 * 2);
    });

    it("should correctly callback for a day timer", () => {
      const mock = jest.fn();
      instance.addTimer(mock, { interval: TimeSync.DAYS });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(
        1000 * 60 * 60 * 24 * 2 - 2 - new Date().getTimezoneOffset() * 60 * 1000
      );

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(
        60 * 60 * 24 * 2 + new Date().getTimezoneOffset() * 60
      );
    });

    it("should work with a mix of timers", () => {
      const mockSecond = jest.fn();
      const mockTenSeconds = jest.fn();
      const mockMinute = jest.fn();
      instance.addTimer(mockSecond);
      instance.addTimer(mockTenSeconds, { unit: 10 });
      instance.addTimer(mockMinute, { interval: TimeSync.MINUTES });

      clock.tick(1000 * 60 - 1);

      expect(mockSecond).toHaveBeenCalledTimes(60);
      expect(mockSecond.mock.calls).toMatchSnapshot();

      expect(mockTenSeconds).toHaveBeenCalledTimes(6);
      expect(mockTenSeconds.mock.calls).toMatchSnapshot();

      expect(mockMinute).toHaveBeenCalledTimes(1);
      expect(mockMinute.mock.calls).toMatchSnapshot();
    });

    it("should clean up timeouts if the last timer is removed", () => {
      const mock = jest.fn();
      const ref = instance.addTimer(mock);

      clock.tick(1000);
      expect(mock).toHaveBeenCalledTimes(1);
      ref();

      clock.tick(1000);
      expect(mock).toHaveBeenCalledTimes(1);
    });

    it("should correctly remove timer if it schedules for the next tick", () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();
      const mock3 = jest.fn();
      const mock4 = jest.fn();
      instance.addTimer(mock1);
      const removeReference = instance.addTimer(mock2);
      instance.addTimer(mock3, { interval: TimeSync.MINUTES });
      instance.addTimer(mock4);

      // Advance to just before two minute
      clock.tick(1000 * 60 - 2 - 10000);

      expect(mock1).toHaveBeenCalledTimes(49);
      expect(mock2).toHaveBeenCalledTimes(49);
      expect(mock3).toHaveBeenCalledTimes(0);
      expect(mock4).toHaveBeenCalledTimes(49);

      removeReference();

      clock.tick(200);

      expect(mock1).toHaveBeenCalledTimes(50);
      expect(mock2).toHaveBeenCalledTimes(49);
      expect(mock3).toHaveBeenCalledTimes(1);
      expect(mock4).toHaveBeenCalledTimes(50);
    });

    it("removing a timer should not throw if it is called after all timers have been removed", () => {
      const mock = jest.fn();
      const ref = instance.addTimer(mock);

      instance.removeAllTimers();
      ref();
    });

    it("removing a timer should not throw if it is called multiple times", () => {
      const mock = jest.fn();
      const ref = instance.addTimer(mock);

      ref();
      ref();
      ref();
    });
  });

  describe("#getCurrentTime", () => {
    it("should be exported correctly", () => {
      expect(TimeSync.getCurrentTime).toBeInstanceOf(Function);
    });

    it("should give the correctly rounded value", () => {
      expect(TimeSync.getCurrentTime()).toBe(10);
      clock.tick(1250);
      expect(TimeSync.getCurrentTime()).toBe(11);
    });

    it("should work for defined timer configurations", () => {
      const timerConfig = { unit: 90, interval: TimeSync.MINUTES };
      expect(TimeSync.getCurrentTime(timerConfig)).toBe(0);
      clock.tick(1000 * 60 * 60 * 2);
      expect(TimeSync.getCurrentTime(timerConfig)).toBe(60 * 90);
    });

    it("should return adjusted timezone value for DAYS configurations", () => {
      const timerConfig = { interval: TimeSync.DAYS };
      const timezoneOffset = new Date().getTimezoneOffset() * 60;
      expect(TimeSync.getCurrentTime(timerConfig)).toBe(timezoneOffset);
      clock.tick(1000 * 60 * 60 * 24 * 2);
      expect(TimeSync.getCurrentTime(timerConfig)).toBe(
        24 * 60 * 60 * 2 + timezoneOffset
      );
    });
  });

  describe("#removeAllTimers", () => {
    it("should be exported correctly", () => {
      expect(instance.removeAllTimers).toBeInstanceOf(Function);
    });
  });

  describe("#revalidateAllTimers", () => {
    it("should be exported correctly", () => {
      expect(instance.revalidateAllTimers).toBeInstanceOf(Function);
    });

    it("should fire all necessary timers if system clock has changed", () => {
      const mockSecond = jest.fn();
      const mockTenSeconds = jest.fn();
      const mockMinute = jest.fn();
      instance.addTimer(mockSecond);
      instance.addTimer(mockTenSeconds, { unit: 10 });
      instance.addTimer(mockMinute, { interval: TimeSync.MINUTES });

      clock.setSystemTime(1000 * 60 * 60);

      expect(mockSecond).toHaveBeenCalledTimes(0);
      expect(mockTenSeconds).toHaveBeenCalledTimes(0);
      expect(mockMinute).toHaveBeenCalledTimes(0);

      clock.tick(1);

      expect(mockSecond).toHaveBeenCalledTimes(0);
      expect(mockTenSeconds).toHaveBeenCalledTimes(0);
      expect(mockMinute).toHaveBeenCalledTimes(0);

      instance.revalidateAllTimers();
      clock.tick(1);

      expect(mockSecond).toHaveBeenCalledTimes(1);
      expect(mockTenSeconds).toHaveBeenCalledTimes(1);
      expect(mockMinute).toHaveBeenCalledTimes(1);
    });

    it("should revalidate even if next timer has not fired yet", () => {
      const mock = jest.fn();
      instance.addTimer(mock);

      clock.setSystemTime(10250);
      instance.revalidateAllTimers();

      clock.tick(750);
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenLastCalledWith(11);
    });

    it("should resync automatically after any timer is fired", () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();
      const mock3 = jest.fn();
      instance.addTimer(mock1);
      instance.addTimer(mock2, { unit: 2 });
      instance.addTimer(mock3, { unit: 2 });

      clock.setSystemTime(12500);
      clock.tick(999);

      expect(mock1).toHaveBeenCalledTimes(1);
      expect(mock2).toHaveBeenCalledTimes(1);
      expect(mock3).toHaveBeenCalledTimes(1);
    });

    it("should not automatically revalidate after a future timer has been removed", () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();

      const ref = instance.addTimer(mock1, { interval: TimeSync.MINUTES });
      instance.addTimer(mock2);

      clock.setSystemTime(1250);
      ref();

      expect(mock2).toHaveBeenCalledTimes(0);
    });

    it("should not break if removal of timer removes second timer", () => {
      // eslint-disable-next-line prefer-const
      let removeSecondTimerRef: () => void;

      instance.addTimer(() => {
        removeSecondTimerRef();
      });
      removeSecondTimerRef = instance.addTimer(jest.fn());

      clock.tick(1000);
    });
  });
});
