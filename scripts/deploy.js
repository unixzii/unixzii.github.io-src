const path = require('path');
const fs = require('fs');
const fsEx = require('fs-extra');
const child_process = require('child_process');
const chalk = require('chalk');

const paths = {
  deployDir: path.resolve('deploy'),
  appDir: [
    path.resolve('dist'),
    path.resolve('public'),
    path.resolve('index.html'),
    path.resolve('404.html')
  ]
};

const deployRepo = 'https://github.com/unixzii/unixzii.github.io.git';

// check deploy directory
let repoReady = false;
if (fs.existsSync(paths.deployDir)) {
  const out = runUnderRepo('git remote get-url origin').toString().trim();
  if (out === deployRepo) {
    repoReady = true;
  } else {
    log('expect remote: ' + deployRepo + '\nbut got: ' + out);
  }
}

if (!repoReady) {
  logError('could not find git repository at: ' + paths.deployDir);
  process.exit(1);
}

// pull out newest commits
try {
  runUnderRepo('git pull origin master');
} catch (err) {
  logError(`Error occurred while executing ${chalk.bold('git pull')}:`);
  logError(err.toString());
}

// copy built files
paths.appDir.forEach(p => {
  log(chalk.green(`copying ${chalk.bold(p)}...`));
  fsEx.copySync(p, path.join(paths.deployDir, path.basename(p)));
});

runUnderRepo('git add .');
runUnderRepo(`git commit -m "auto-deploy update"`);
runUnderRepo('git push origin master');

function runUnderRepo(cmd) {
  return child_process.execSync(cmd, { cwd: paths.deployDir });
}

function logError(msg) {
  console.error(chalk.red(msg));
}

function log(msg) {
  console.log(msg);
}