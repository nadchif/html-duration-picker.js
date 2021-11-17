// webpack.config.js
const webpack = require('webpack');
const WebpackAutoInject = require('webpack-auto-inject-version');
const path = require('path');
const fs = require('fs');
const CreateFileWebpack = require('create-file-webpack');

const pickerStyles = fs
  .readFileSync(path.join(__dirname, 'src', 'style.css'))
  .toString()
  .replace(/\n/gi, ''); // load styles.css

module.exports = (env, args) => {
  const browserTarget =
    env && env.target == 'ie'
      ? {
          targets: {
            chrome: '58',
            ie: '9',
          },
          useBuiltIns: 'usage',
        }
      : {};

  return {
    context: __dirname,

    entry: './src/html-duration-picker.js',
    output: {
      path:
        args.mode == 'development'
          ? path.resolve(__dirname, 'src/compiled')
          : path.resolve(__dirname, 'dist'),
      filename:
        args.mode == 'development' ? 'html-duration-picker.js' : 'html-duration-picker.min.js',
      library: 'HtmlDurationPicker',
      libraryTarget: 'umd',
      libraryExport: 'default',
      // umdNamedDefine: true,
      globalObject: 'this',
    },
    devServer: {
      contentBase: path.join(__dirname, 'src'),
      compress: true,
      port: 9000,
      open: true,
      watchContentBase: true,
      // public: require('os').hostname().toLowerCase() + ':9000',
      disableHostCheck: true,
      host: '127.0.0.1',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: ['babel-plugin-remove-template-literals-whitespace'],
              presets: [['@babel/preset-env', browserTarget]],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        PICKER_STYLES_CSS_CONTENTS: JSON.stringify(pickerStyles),
      }),
      new WebpackAutoInject({
        components: {
          AutoIncreaseVersion: true,
          InjectAsComment: false,
          InjectByTag: true,
        },
      }),
      new CreateFileWebpack({
        path: './dist',
        fileName: 'html-duration-picker.min.d.ts',
        content: `declare module '${process.env.npm_package_name}'`,
      }),
    ],
  };
};
