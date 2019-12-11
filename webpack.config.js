// webpack.config.js
const WebpackAutoInject = require('webpack-auto-inject-version');
const path = require( 'path' );
const CreateFileWebpack = require('create-file-webpack');

module.exports =(env, args)=> {
  console.log(args.mode);
  return {context: __dirname,
    entry: './src/html-duration-picker.js',
    output: {
      path: args.mode == 'development' ? path.resolve( __dirname, 'src/compiled' ) : path.resolve( __dirname, 'dist' ),
      filename: args.mode == 'development' ? 'html-duration-picker.js' : 'html-duration-picker.min.js',
      library: 'HtmlDurationPicker',
      libraryTarget: 'umd',
      libraryExport: 'default',
      // umdNamedDefine: true,
      globalObject: 'this',
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
      new CreateFileWebpack({
        path: './dist',
        fileName: 'html-duration-picker.min.d.ts',
        content: `declare module '${process.env.npm_package_name}'`,
      }),
    ],
  };
};
