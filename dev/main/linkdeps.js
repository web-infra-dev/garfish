const { exec } = require('child_process');

[
  '@garfish/core',
  '@garfish/router',
  '@garfish/browser-snapshot',
  '@garfish/browser-vm',
  '@garfish/core',
  '@garfish/loader',
  '@garfish/cjs-app',
].forEach((item) => {
  console.log(`link ${item}`);
  exec(`yarn link ${item}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行的错误: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
});
