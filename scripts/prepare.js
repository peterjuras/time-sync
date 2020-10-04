const execa = require("execa");
const path = require("path");

async function main() {
  const currentFolder = path.basename(process.cwd());

  if (currentFolder === "build") {
    // Don't run sync and build inside the build folder before publishing
    return;
  }

  // Run coat sync and build sequentially
  await execa("npx", ["coat", "sync"], { stdio: "inherit" });
  await execa("npx", ["coat", "run", "build"], { stdio: "inherit" });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
