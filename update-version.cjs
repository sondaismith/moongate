//Based on process outlined here: https://dev.to/rensjaspers/how-to-include-version-git-commit-and-build-date-in-your-angular-builds-53ok
const fs = require("fs");
const execSync = require("child_process").execSync;

const version = require("./package.json").version;
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const buildDate = new Date().toUTCString();

const content = `export const version = '${version}';
export const buildDate = '${buildDate}';
export const commitHash = '${commitHash}';`;

fs.writeFileSync("./src/helpers/version.ts", content);

console.log("Updated application version!", { version, commitHash, buildDate });