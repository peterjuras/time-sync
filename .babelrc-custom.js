module.exports = (oldConfig) => {
  oldConfig.presets[1] = [
    "@babel/preset-env",
    {
      targets: "> 0.25%, not dead, iOS 9",
    },
  ];
  return {
    ...oldConfig,
    plugins: ["@babel/plugin-proposal-class-properties"],
  };
};
