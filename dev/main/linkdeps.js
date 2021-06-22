const { exec } = require('child_process');

[
  'garfish',
  // '@garfish/core',
  // '@garfish/router',
  // '@garfish/browser-snapshot',
  // '@garfish/browser-vm',
  // '@garfish/core',
  // '@garfish/loader',
].forEach((item) => {
  console.log(`link ${item}`);
  exec(`yarn link ${item}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行的错误: ${error}`);
      return;
    }
    stdout && console.log(`stdout: ${stdout}`);
    stderr && console.error(`stderr: ${stderr}`);
  });
});
