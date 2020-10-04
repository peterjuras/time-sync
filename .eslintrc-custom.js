module.exports = (oldConfig) => {
  return {
    ...oldConfig,
    overrides: [
      {
        files: ["*.test.ts"],
        rules: {
          "@typescript-eslint/no-explicit-any": 0,
          "@typescript-eslint/no-var-requires": 0,
          "@typescript-eslint/explicit-function-return-type": 0,
        },
        env: {
          jest: true,
        },
        globals: {
          fail: true,
        },
      },
      {
        files: ["*.js"],
        rules: {
          "@typescript-eslint/no-var-requires": 0,
          "no-console": 0,
        },
      },
    ],
  };
};
