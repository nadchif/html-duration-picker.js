// webpack.config.js
const WebpackAutoInject = require('webpack-auto-inject-version');
const path = require( 'path' );
module.exports = {
  context: __dirname,
  entry: './src/html-duration-picker.js',
  output: {
    path: path.resolve( __dirname, 'dist' ),
    filename: 'html-duration-picker.min.js',
    library: 'HtmlDurationPicker',
    libraryTarget: 'umd',
    libraryExport: 'default',
    // umdNamedDefine: true,
    globalObject: 'typeof self !== "undefined" ? self : this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new WebpackAutoInject( {
      components: {
        AutoIncreaseVersion: true,
        InjectAsComment: false,
        InjectByTag: true,
      },
    }),
  ],
};
