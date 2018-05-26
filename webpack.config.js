require('dotenv').config();

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const rxPaths = require('rxjs/_esm2015/path-mapping');
const {
  mainThreadReduxDevToolsPort,
} = require('./buildConstants');

const buildOutputDir = 'dist';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env', {
          targets: {
            browsers: ['last 1 Chrome version'],
          },
        },
      ],
    ],
  },
};

const mode = process.env.WEBPACK_SERVE ? 'development' : 'production';

const config = {
  mode,
  entry: ['./src/index'],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: rxPaths(),
  },
  output: {
    path: path.resolve(buildOutputDir),
    filename: 'bundle.[hash].js',
    chunkFilename: '[name].[hash]js',
    pathinfo: (mode === 'production') ? false : true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          babelLoader,
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      GITHUB_TOKEN: (mode === 'development' && GITHUB_TOKEN !== undefined) ? JSON.stringify(GITHUB_TOKEN) : 'undefined',
      'process.env.NODE_ENV': JSON.stringify(mode),
      MAIN_THREAD_REDUX_DEV_TOOLS_PORT: JSON.stringify(mainThreadReduxDevToolsPort),
    }),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
    }),
  ],
};

module.exports = config;
