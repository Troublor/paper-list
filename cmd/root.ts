import {Command, flags} from '@oclif/command';
import BuildCommand from './build';

// eslint-disable-next-line require-jsdoc
class RootCommand extends Command {
  static flags = {
    version: flags.version(),
    help: flags.boolean({
      char: 'h',
    }),
  };

  static strict = false;

  static args = [
    {
      name: 'subCmd',
      options: ['build'],
    },
  ];

  // eslint-disable-next-line require-jsdoc
  async run() {
    const {args, argv, flags} = this.parse(RootCommand);
    switch (args.subCmd) {
      case 'build':
        const subArgs: string[] = flags.help ? ['--help'] : argv.slice(1);
        await BuildCommand.run(subArgs);
        break;
      default:
        this._help();
    }
  }

  // eslint-disable-next-line require-jsdoc
  protected _helpOverride(): boolean {
    return false;
  }
}

RootCommand.run().then(() => {
}, require('@oclif/errors/handle'));
