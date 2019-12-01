// webpack.config.js
const path = require( 'path' );
module.exports = {
  context: __dirname,
  entry: './src/html-duration-picker.js',
  output: {
    path: path.resolve( __dirname, 'dist' ),
    filename: 'html-duration-picker.min.js',
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
};
