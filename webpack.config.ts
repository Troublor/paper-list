import path from 'path';
import webpack, {Configuration, ProgressPlugin} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';
import fs from 'fs';
import WatchExternalFilesPlugin from 'webpack-watch-files-plugin';

// eslint-disable-next-line require-jsdoc
function loadData(source: string): Record<string, unknown>[] {
  const entries: Record<string, unknown>[] = [];
  if (!fs.existsSync(source)) {
    throw new Error(`${source} is not file or directory`);
  }

  const loadFile = (f: string): Record<string, unknown>[] => {
    let data;
    switch (path.extname(f).toLowerCase()) {
      case '.json':
        data = JSON.parse(fs.readFileSync(f, {encoding: 'utf-8'}));
        break;
      case '.js':
        data = require(f);
        break;
      default:
        throw new Error(
            `File type ${path.extname(f).toLowerCase()} not supported`);
    }
    if (!Array.isArray(data)) {
      throw new Error(`JSON object is not an array`);
    }
    // TODO validate json schema
    return data;
  };

  if (fs.statSync(source).isFile()) {
    entries.push(...loadFile(source));
  } else if (fs.statSync(source).isDirectory()) {
    // TODO
  } else {
    // TODO
  }
  return entries;
}


const webpackConfig = (env: {
  production?: boolean,
  development?: boolean,
  out?: string,
  title?: string,
  description?: string,
  data?: string,
}): Configuration => {
  env = Object.assign({
    production: true,
    development: false,
    out: process.env.OUT ?? path.join(__dirname, 'dist'),
    title: process.env.TITLE ?? 'Paper List',
    description: process.env.DESCRIPTION ?? '',
    data: process.env.DATA,
  }, env);
  if (!env.data) {
    throw new Error('Must provide publication declaration data source');
  }
  return {
    entry: './src/index.tsx',
    ...(env.production || !env.development ? {} : {devtool: 'eval-source-map'}),
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      // TODO waiting on https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/61
      // @ts-ignore
      plugins: [new TsconfigPathsPlugin()],
      alias: {
        react: path.resolve('./node_modules/react'),
      },
    },
    output: {
      path: env.out,
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
          exclude: [
            /css/,
            /images/,
            /materials/,
            /node_modules/,
            /scripts/,
          ],
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'public/index.html',
      }),
      new webpack.DefinePlugin({
        'DATA': webpack.DefinePlugin.runtimeValue(
            ()=>JSON.stringify(loadData(env.data as string)), {
              fileDependencies: [env.data],
            }),
        'TITLE': JSON.stringify(env.title),
        'DESCRIPTION': JSON.stringify(env.description),
      }),
      new ProgressPlugin(function(percentage, msg) {
        process.stdout.write('\r\x1b[K');
        process.stdout.write('Webpack building: ' +
          (percentage * 100).toFixed(2) + '% ' + msg);
      }),
      new WatchExternalFilesPlugin({files: [env.data]}),
      // new ForkTsCheckerWebpackPlugin({
      //   // eslint: {
      //   // eslint-disable-next-line max-len
      //   //     files: "./src/**/*.{ts,tsx,js,jsx}" // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
      //   // }
      // }),
    ],
  };
};

export default webpackConfig;
