const portMap = require('./config.json');
const isDevelopment = process.env.NODE_ENV !== 'production';
const getPublicPath = (appName) => {
  const port = portMap[appName].port;
  const publicPath = portMap[appName].publicPath;
  return `//localhost:${port}/`;
};

const getPort = (appName) => portMap[appName].port;
module.exports = {
  isDevelopment,
  getPublicPath,
  getPort,
};
