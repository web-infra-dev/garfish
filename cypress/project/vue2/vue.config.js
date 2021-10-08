module.exports = {
  publicPath: 'http://localhost:2777',

  css: { extract: false },

  devServer: {
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port: 2777,
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
