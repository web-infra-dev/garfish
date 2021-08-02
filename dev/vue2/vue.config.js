module.exports = {
  // chainWebpack: config => {
  //   config.optimization.delete('splitChunks')
  //   config.module
  //     .rule('images')
  //     .use('url-loader')
  //     .loader('url-loader')
  //     .tap(options => Object.assign(options, { limit: 10240 }))
  // },
  configureWebpack: () => {
    return {
      entry: './src/main.js',
      output: {
        filename: 'index.js',
        libraryTarget: 'umd',
        globalObject: 'window',
      },
    };
  },
  publicPath: 'http://localhost:9099',
  css: { extract: false },
  devServer: {
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port: 9099,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
