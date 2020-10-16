const config = require("./jest.config.json");

module.exports = {
  ...config,
  coverageReporters: ["lcov"],
};
