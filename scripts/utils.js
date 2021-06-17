const fs = require('fs');
const chalk = require('chalk');

const allTargets = (exports.allTargets = fs
  .readdirSync('packages/runtime')
  .filter((f) => {
    if (!fs.statSync(`packages/runtime/${f}`).isDirectory()) {
      return false;
    }

    if (!fs.existsSync(`packages/runtime/${f}/package.json`)) {
      return false;
    }

    return true;
  }));

exports.clearConsole = function clearConsole(title) {
  console.clear();
  title = title || '😈 Garfish build script';
  console.log(chalk.cyan.bold(title));
};

exports.sleep = function (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

exports.toCamelCase = function (v, f = true) {
  return v
    .split(/[_-]/g)
    .map((l, i) => {
      if (!l) return;
      return !f && i === 0
        ? l.toLocaleLowerCase()
        : l.charAt(0).toLocaleUpperCase() + l.slice(1).toLocaleLowerCase();
    })
    .join('');
};

// `import '@garfish/xx';` 这种不管
exports.matchPkgName = function (pkgName) {
  return new RegExp(
    `import\\s+((\\{?\\s*[^;\\n\*]*\\s*\}?)|\\*\\s+as\\s+([^;\\n]+))\\s+from\\s+['"](${pkgName})['"];?`,
    'g',
  );
};

exports.getDeps = function (code) {
  let res;
  const deps = [];
  const reg = exports.matchPkgName('@garfish\\/.*');

  while ((res = reg.exec(code))) {
    const idx = res[3] ? 3 : 1;
    const pkgName = res[4] ? res[4].trim() : '';
    let exports = res[idx] ? res[idx].trim() : '';

    if (exports.startsWith('{') && exports.endsWith('}')) {
      exports = exports
        .slice(1)
        .slice(0, -1)
        .trim()
        .split(',')
        .map((v) => v.trim());
    }
    deps.push({
      exports,
      pkgName,
      isAlias: !!res[3],
    });
  }
  return deps;
};

exports.fuzzyMatchTarget = function (partialTargets) {
  const matched = [];
  partialTargets.forEach((partialTarget) => {
    for (const target of allTargets) {
      // if (target.match(partialTarget)) {
      if (target === partialTarget) {
        matched.push(target);
      }
    }
  });

  if (matched.length) {
    return matched;
  } else {
    console.log();
    console.error(
      `   ${chalk.red.bold(
        `Target ${chalk.underline(partialTargets)} not found!`,
      )}`,
    );
    console.log();

    process.exit(1);
  }
};
