import {Command, flags} from '@oclif/command';
import webpack from 'webpack';
import webpackConfig from '../webpack.config';
import * as path from 'path';

// eslint-disable-next-line require-jsdoc
export default class BuildCommand extends Command {
  static flags = {
    version: flags.version(),
    help: flags.help(),
    watch: flags.boolean({
      char: 'w',
      description: 'watch for source changes',
    }),
    out: flags.string({
      char: 'o',
      default: path.join(process.cwd(), 'paper-list'),
      parse: (input) =>
        path.isAbsolute(input) ? input : path.join(process.cwd(), input),
    }),
    title: flags.string({
      char: 't',
    }),
    description: flags.string({
      char: 'd',
    }),
  };

  static args = [
    {
      name: 'declaration file or directory',
      required: false,
      description:
        'the file or directory contains the publication declarations',
    },
  ];

  // eslint-disable-next-line require-jsdoc
  async run() {
    const {flags, args} = this.parse(BuildCommand);
    const compiler = webpack(webpackConfig({
      production: true,
      out: flags.out,
      data: args['declaration file or directory'],
      title: flags.title,
      description: flags.description,
    }));
    const cb = (err, stats) => {
      if (err) throw err;
      if (stats) {
        if (stats.hasErrors()) throw new Error(stats.toString());
        console.log(stats.toString());
      }
    };
    if (flags.watch) {
      compiler.hooks.watchRun.tap('NotifyChange', ()=>{
        console.log('\nFile change detected. Recompiling...');
      });
      compiler.hooks.afterDone.tap('NotifyDone', ()=>{
        console.log('\nCompilation done.');
      });
      compiler.watch({}, cb);
    } else {
      compiler.run(cb);
    }
  }
}
