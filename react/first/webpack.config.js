/* eslint-env node */

const webpack = require('webpack');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  devtool: IS_PRODUCTION ? '' : '#source-map',
  context: __dirname,
  entry  : {
    main: './src/main.js'
  },
  output: {
    path      : __dirname,
    publicPath: '/',
    filename  : 'build/[name].bundle.js',
    pathinfo  : !IS_PRODUCTION
  },
  plugins: IS_PRODUCTION
    ? [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin()
    ]
    : [
      new webpack.LoaderOptionsPlugin({
        debug: !IS_PRODUCTION
      })
    ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use : {
          loader : 'babel-loader',
          options: {
            presets: [
              ['env', {
                targets: {
                  browsers: 'last 2 versions',
                  uglify  : true
                }
              }],
              ['react']
            ]
          }
        }
      }
    ]
  }
};
