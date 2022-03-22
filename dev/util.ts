import portMap from './config.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

const getPublicPath = (appName: string) => {
  const port = portMap[appName].port;
  const publicPath = portMap[appName].publicPath;
  return !isDevelopment ? publicPath : `//localhost:${port}/`;
};

const getPort = (appName: string) => portMap[appName].port;
export { isDevelopment, getPublicPath, getPort };
