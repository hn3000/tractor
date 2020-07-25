const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  entry: {
    tractor: './src/index.ts',
  },
  devServer: {
    contentBase: './run',
    before: (app, server, compiler) => {
      app.get('/images/:file', (req, res) => {
        const { file } = req.params;
        console.log('request: ', req.method, req.url, file);
        res.sendFile(path.resolve('./', '.'+req.url));
      });
    },
    //hot: true,
    compress: true,
    port: 9000
  },
  output: {
    path: path.resolve(__dirname, 'run'),
    filename: '[name].bundle.js'
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ['ts-loader'], exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|svg|jpg|gif)$/, use: ['file-loader'] }
    ]
  },

  node: {
    fs: "empty",
    module: "empty"
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'new tab page',
      template: 'src/template.html',
      filename: 'index.html',
      inject: true,
      chunks: ['tractor']
    }),
    new webpack.NamedModulesPlugin(),
    /*new webpack.HotModuleReplacementPlugin({
      // Options...
    })*/
  ],

}
