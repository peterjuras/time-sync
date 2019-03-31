module.exports = {
  preset: "ts-jest",
  collectCoverage: true,
  modulePathIgnorePatterns: ["<rootDir>/build"],
  coverageReporters: ["text"]
};
