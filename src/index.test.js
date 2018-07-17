import TimeSync from "./index";

describe("#TimeSync", () => {
  const instance = new TimeSync();

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

  it("should export revalidate correctly", () =>
    expect(instance.revalidate).toBeInstanceOf(Function));

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
});
