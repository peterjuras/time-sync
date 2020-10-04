// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = ({ files, ...packageJsonProps }) => {
  return {
    ...packageJsonProps,
    scripts: {
      ...packageJsonProps.scripts,
      prepare: "node scripts/prepare",
    },
  };
};
