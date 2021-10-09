import { Countdowns } from "./countdowns";
import TimeSync from "./index";
import { Timers } from "./timers";

jest.mock("./countdowns").mock("./timers");

describe("#TimeSync", () => {
  const instance = new TimeSync();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be exported correctly", () => {
    expect(instance).toBeInstanceOf(TimeSync);
  });

  describe("#constants", () => {
    it("SECONDS should be exported correctly", () => {
      expect(TimeSync.SECONDS).toBe("s");
    });

    it("MINUTES should be exported correctly", () => {
      expect(TimeSync.MINUTES).toBe("m");
    });

    it("HOURS should be exported correctly", () => {
      expect(TimeSync.HOURS).toBe("h");
    });

    it("DAYS should be exported correctly", () => {
      expect(TimeSync.DAYS).toBe("d");
    });
  });

  it("should export addTimer correctly", () =>
    expect(instance.addTimer).toBeInstanceOf(Function));

  it("should export removeAllTimers correctly", () =>
    expect(instance.removeAllTimers).toBeInstanceOf(Function));

  it("should export createCountdown correctly", () =>
    expect(instance.createCountdown).toBeInstanceOf(Function));

  it("should export stopAllCountdowns correctly", () =>
    expect(instance.stopAllCountdowns).toBeInstanceOf(Function));

  it("should export getCurrentTime correctly", () => {
    expect(TimeSync.getCurrentTime).toBeInstanceOf(Function);
    expect(TimeSync.getCurrentTime).toBe(instance.getCurrentTime);
  });

  it("should export getTimeLeft correctly", () => {
    expect(TimeSync.getTimeLeft).toBeInstanceOf(Function);
    expect(TimeSync.getTimeLeft).toBe(instance.getTimeLeft);
  });

  describe("#revalidate", () => {
    it("should export revalidate correctly", () =>
      expect(instance.revalidate).toBeInstanceOf(Function));

    it("should revalidate all timers", () => {
      const spy = jest.spyOn(Timers.prototype, "revalidateAllTimers");
      expect(spy).not.toHaveBeenCalled();

      instance.revalidate();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should revalidate all countdowns", () => {
      const spy = jest.spyOn(Countdowns.prototype, "revalidateAllCountdowns");
      expect(spy).not.toHaveBeenCalled();

      instance.revalidate();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
