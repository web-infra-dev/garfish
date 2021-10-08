const portInfo = require('../config.json')['cypress/project/vue2'];

module.exports = {
  publicPath: `http://localhost:${portInfo.port}`,

  css: { extract: false },

  devServer: {
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port: portInfo.port,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  configureWebpack: () => {
    return {
      entry: './src/main.js',
      mode: process.env.TEST_ENV ? 'production' : 'development',
      output: {
        filename: 'index.js',
        libraryTarget: 'umd',
        globalObject: 'window',
      },
    };
  },
};
