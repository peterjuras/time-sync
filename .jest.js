module.exports = {
  collectCoverage: true,
  modulePathIgnorePatterns: ["<rootDir>/build"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text"],
  testEnvironment: "node",
  testRunner: "jest-circus/runner",
};
