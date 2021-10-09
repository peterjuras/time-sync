import TimeSync from "./index";
import { Countdowns } from "./countdowns";
import FakeTimers from "@sinonjs/fake-timers";

describe("#countdowns", () => {
  const instance = new Countdowns();
  let clock: FakeTimers.InstalledClock;

  beforeEach(() => {
    clock = FakeTimers.install({ now: 10001 });
  });

  afterEach(() => {
    clock.uninstall();
    instance.stopAllCountdowns();
  });

  describe("#createCountdown", () => {
    it("should be exported correctly", () => {
      expect(instance.createCountdown).toBeInstanceOf(Function);
    });

    it("should throw if no callback is provided", () => {
      expect(() =>
        instance.createCountdown(null as any, { until: 123 })
      ).toThrowErrorMatchingSnapshot();
    });

    it("should throw if for an unknown interval", () => {
      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: 123,
          interval: [] as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: 123,
          interval: {} as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: 123,
          interval: 123 as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: 123,
          interval: "" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: 123,
          interval: "a" as any,
        })
      ).toThrowErrorMatchingSnapshot();
    });

    it("should throw if for an invalid or missing until", () => {
      expect(() =>
        instance.createCountdown(jest.fn(), {} as any)
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: [] as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: {} as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: "" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: "a" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: "15" as any,
        })
      ).toThrowErrorMatchingSnapshot();

      expect(() =>
        instance.createCountdown(jest.fn(), {
          until: 250.291,
        })
      ).toThrowErrorMatchingSnapshot();
    });

    it("should add a second countdown by default", () => {
      const mock = jest.fn();
      instance.createCountdown(mock, { until: 13000 });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(998);
      expect(mock).toHaveBeenCalledTimes(0);

      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(1);

      clock.tick(999);
      expect(mock).toHaveBeenCalledTimes(1);

      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(2);

      clock.tick(10000);
      expect(mock).toHaveBeenCalledTimes(3);
    });

    it("should correctly callback for a second countdown", () => {
      const mock = jest.fn();
      instance.createCountdown(mock, {
        interval: TimeSync.SECONDS,
        until: 20 * 1000,
      });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(1000 * 3 - 2);

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(8);
    });

    it("should correctly callback for a minute countdown", () => {
      const mock = jest.fn();
      instance.createCountdown(mock, {
        interval: TimeSync.MINUTES,
        until: 1000 * 3 * 60 + 10000,
      });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(60000 * 2 - 2);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenLastCalledWith(2);
      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(1);
    });

    it("should correctly callback for an hour countdown", () => {
      const mock = jest.fn();
      instance.createCountdown(mock, {
        interval: TimeSync.HOURS,
        until: 1000 * 60 * 60 * 4 + 10000,
      });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(1000 * 60 * 60 * 2 - 2);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenLastCalledWith(3);
      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(2);
    });

    it("should correctly callback for a day timer", () => {
      const mock = jest.fn();
      instance.createCountdown(mock, {
        interval: TimeSync.DAYS,
        until: 1000 * 60 * 60 * 4 * 24 + 10000,
      });

      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(1000 * 60 * 60 * 24 * 2 - 2);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenLastCalledWith(3);
      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(2);
    });

    it("should work with a mix of countdowns", () => {
      const mockSecond = jest.fn();
      const mockSecondDelayed = jest.fn();
      const mockMinute = jest.fn();
      instance.createCountdown(mockSecond, { until: 2 * 1000 + 10000 });
      instance.createCountdown(mockSecondDelayed, { until: 2500 + 10000 });
      instance.createCountdown(mockMinute, {
        interval: TimeSync.MINUTES,
        until: 30 * 1000 + 10000,
      });

      clock.tick(1000 * 60);

      expect(mockSecond).toHaveBeenCalledTimes(2);
      expect(mockSecond.mock.calls).toMatchSnapshot();

      expect(mockSecondDelayed).toHaveBeenCalledTimes(3);
      expect(mockSecondDelayed.mock.calls).toMatchSnapshot();

      expect(mockMinute).toHaveBeenCalledTimes(1);
      expect(mockMinute.mock.calls).toMatchSnapshot();
    });

    it("adding a countdown should throw if the date is in the past", () => {
      expect(() =>
        instance.createCountdown(jest.fn(), { until: 0 })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        instance.createCountdown(jest.fn(), { until: 1 })
      ).toThrowErrorMatchingSnapshot();
    });

    it("adding a countdown with an offset should be called back at the correct times", () => {
      const mock = jest.fn();
      instance.createCountdown(mock, { until: 2050 + 10000 });

      clock.tick(48);
      expect(mock).toHaveBeenCalledTimes(0);
      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenLastCalledWith(2);

      clock.tick(1000);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenLastCalledWith(1);

      clock.tick(999);
      expect(mock).toHaveBeenCalledTimes(2);

      clock.tick(1);
      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock).toHaveBeenLastCalledWith(0);

      clock.tick(10000);
      expect(mock).toHaveBeenCalledTimes(3);
    });

    it("removing a countdown should not throw if it is called after all countdowns have been removed", () => {
      const mock = jest.fn();
      const ref = instance.createCountdown(mock, { until: 123 + 10000 });

      instance.stopAllCountdowns();
      ref();
    });

    it("removing a countdown should not throw if it is called multiple times", () => {
      const mock = jest.fn();
      const ref = instance.createCountdown(mock, { until: 123 + 10000 });

      ref();
      ref();
      ref();
    });
  });

  describe("#getTimeLeft", () => {
    it("should be exported correctly", () => {
      expect(TimeSync.getTimeLeft).toBeInstanceOf(Function);
    });

    it("should throw when no configuration object is passed", () => {
      expect(TimeSync.getTimeLeft).toThrowErrorMatchingSnapshot();
    });

    it("should give the correctly rounded value", () => {
      expect(TimeSync.getTimeLeft({ until: 11001 })).toBe(1);
      clock.tick(1250);
      expect(TimeSync.getTimeLeft({ until: 11001 })).toBe(0);
    });

    it("should work for defined countdown configurations", () => {
      const countdownConfig = {
        until: 1000 * 60 * 60 * 24 * 7,
        interval: TimeSync.DAYS,
      };
      expect(TimeSync.getTimeLeft(countdownConfig)).toBe(7);
      clock.tick(1000 * 60 * 60 * 24 * 5);
      expect(TimeSync.getTimeLeft(countdownConfig)).toBe(2);
    });

    it("should throw if there is no until property", () => {
      const countdownConfig: any = {
        interval: TimeSync.DAYS,
      };
      expect(() =>
        TimeSync.getTimeLeft(countdownConfig)
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe("#stopAllCountdowns", () => {
    it("should be exported correctly", () => {
      expect(instance.stopAllCountdowns).toBeInstanceOf(Function);
    });
  });
});
