// 获取本地开发host，支持 goofy web 启动
export const getProxyHost = (port) => {
  return process.env.inIDE
    ? `//${port}-${process.env.WEBIDE_PODID || ''}.webide-boe.byted.org`
    : `http://localhost:${port}/`;
};
