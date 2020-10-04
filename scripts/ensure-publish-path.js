const path = require("path");

const currentFolder = path.basename(process.cwd());

if (currentFolder !== "build") {
  console.log(
    "ERROR! You can only publish outside of the transpiled /build folder\n"
  );
  process.exit(1);
}
