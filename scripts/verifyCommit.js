const fs = require('fs');
const chalk = require('chalk');
console.log(process.env);
const msgPath = process.env.HUSKY_GIT_PARAMS;
const msg = fs.readFileSync(msgPath, 'utf-8').trim();
const ng =
  'https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.greljkmo14y0';
const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
      'invalid commit message format.',
    )}\n\n` +
      chalk.red(
        '  Proper commit message format is required for automated changelog generation. Examples:\n\n',
      ) +
      `    ${chalk.green('feat(compiler): add `comments` option')}\n` +
      `    ${chalk.green('fix(event): handle events error (close #28)')}\n\n` +
      chalk.red(`  See '${ng}' for more details.\n`),
  );
  process.exit(1);
}
