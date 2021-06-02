#!/usr/bin/env node

const path = require('path');
const child_process = require('child_process');

child_process.execSync("./node_modules/.bin/react-app-rewired build " + process.argv.slice(2).join(" "), {
    cwd: path.join(__dirname, '..'),
    stdio: "inherit"
})