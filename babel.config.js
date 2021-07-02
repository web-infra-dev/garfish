
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        targets: ['last 2 versions', 'ie >= 9'],
        modules: 'commonjs',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-regenerator'],
};

