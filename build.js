#!/usr/bin/env node

const child_process = require('child_process');
child_process.spawnSync("./node_modules/.bin/react-app-rewired",["build"], {
    cwd: __dirname,
    stdio: "inherit"
})