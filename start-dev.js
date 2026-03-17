process.chdir(__dirname);
require("child_process").execSync("npx next dev", { stdio: "inherit" });
