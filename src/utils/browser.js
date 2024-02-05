import process from 'node:process';
import { basename, resolve, join, dirname, parse } from "node:path";
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { pipeline, finished } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import {
  readdirSync,
  stat,
  statSync,
  ReadStream,
  WriteStream,
  createReadStream,
  createWriteStream,
} from "node:fs";
import {
  rename,
  unlink,
} from "node:fs/promises";

const getParam = (name) => {
  const mask = `--${name}=`;
  const value = process.argv.filter((arg) => arg.startsWith(mask)).pop();
  return `${value || mask}`.substring(mask.length);
}
const getText = (text, name) => {
  const username = `${name.substring(0, 1).toUpperCase()}${name.substring(1)}`;
  return text.replace('$1', username);
}
const getInput = (data) => {
  const buffer = data.slice(0, Math.max(0, data.length - 2));
  return buffer.toString();
}
const getAction = (data) => {
  const line = getInput(data);
  const params = line.split(' ');
  const action = params.shift();
  return [action, params];
}
const exit = () => process.exit(0);
const getWorkingDir = () => process.cwd();
const getFilePath = (file, dir = getWorkingDir()) => resolve(join(dir, file));
const getFileType = (fileName) => {
  let result = true;
  try {
    result = statSync(fileName).isFile()
  } catch {}
  return result;
}
const setDir = (dir) => process.chdir(dir);
const setParentDir = () => {
  const dir = getWorkingDir();
  const dirPath = parse(dir).dir;
  setDir(dirPath);
};

class Browser {
  constructor() {
    this.username = getParam('username') || 'username';
    this.defaultError = 'Operation failed:';
    this.allowedActions = [
      ['.exit', 'finish'],
      ['up'],
      ['cd'],
      ['ls'],
      ['cat'],
      ['add'],
      ['rn'],
      ['cp'],
      ['mv'],
      ['rm'],
      ['os'],
      ['hash'],
      ['compress'],
      ['decompress'],
    ];
    this.actions = new Map(this.allowedActions.map(([name, func]) => {
      return [name, this[func ?? name] ?? this.error];
    }));
  }
  parseCommand = (data) => {
    const line = getInput(data);
    const params = line.split(' ');
    const action = params.shift();
    return [action, params];
  }
  
  execCommand = async ([action, params]) => {
    try {

      await new Promise ((resolve, reject) => {
        const command = this.actions.get(action) ?? this.error;
        resolve([command, params]);
      })
      .then(async ([command, params]) => await command(params))
      .finally(() => this.showPath());
    } catch(err) {
      console.log(err);
    }
  }

  message = (text = 'Invalid input') => console.log(text);
  error = () => this.message();
  welcome = () => this.message(getText('Welcome to the File Manager, $1!', this.username));
  bye = () => this.message(getText('Thank you for using File Manager, $1, goodbye!', this.username));
  showPath = () => {
    this.message('You are currently in path_to_working_directory');
    this.message(getWorkingDir());
  }
  start = () => {
    this.welcome();
    setDir(process.env.HOME);
    this.showPath();
    process.stdin.on('data', (data) => {
      const params = this.parseCommand(data);
      this.execCommand(params);
    });
    process.on('exit', () => this.bye());
    process.on('SIGINT', () => this.finish());
  }
  finish = () => exit();
  up = () => {
    try {
      setParentDir();
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  cd = ([dir]) => {
    try {
      setDir(dir);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }  
  }
  ls = () => {
    const result = readdirSync(getWorkingDir(), { withFileTypes: true })
    .map((file) => {
      const Name = file.name;
      const fileName = getFilePath(file.name, file.path);
      let isFile = getFileType(fileName);
      const Type = isFile ? 'file' : 'directory';
      return { Name, Type };
    });
    console.table(result);
  }
  cat = async ([fileName]) => {
    try {
      const file = getFilePath(fileName);
      const stream = new ReadStream(file, { encoding: 'utf-8' });
      stream.pipe(process.stdout);
      await finished(stream);
      console.log(os.EOL);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  add = async ([fileName]) => {
    try {
      const file = getFilePath(fileName);
      const stream = new WriteStream(file, { encoding: 'utf-8' });
      stream.close();
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  rn = async ([oldFileName, newFileName]) => {
    try {
      const oldFile = getFilePath(oldFileName);
      const newFile = getFilePath(newFileName);
      await rename(oldFile, newFile);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  cp =  async ([fromFileName, toFileName]) => {
    try {
      const fromFile = getFilePath(fromFileName);
      const toFile = getFilePath(toFileName);
      const readStream = new ReadStream(fromFile, { encoding: 'utf-8' });
      const writeStream = new WriteStream(toFile, { encoding: 'utf-8' });
      readStream.pipe(writeStream);
      await finished(readStream, writeStream)
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  mv = async ([fromFileName, toFileName]) => {
    try {
      const fromFile = getFilePath(fromFileName);
      const toFile = getFilePath(toFileName);
      const readStream = new ReadStream(fromFile, { encoding: 'utf-8' });
      const writeStream = new WriteStream(toFile, { encoding: 'utf-8' });
      readStream.pipe(writeStream);
      await finished(readStream, writeStream);
      if (fromFileName !== toFileName) await unlink(fromFileName);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  rm = async([fileName]) => {
    try {
      const file = getFilePath(fileName);
      await unlink(file);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  os = ([param]) => {
    try {
      const details = {
        '--EOL': JSON.stringify(os.EOL),
        '--cpus': os.cpus(),
        '--homedir': process.env.HOME,
        '--username': os.userInfo()?.username,
        '--architecture': os.arch(),
        unknown: 'Unknown parameter',
      };
      const context = details.hasOwnProperty(param) ? param : 'unknown';
      console.log(details[context]);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  hash = async ([fileName]) => {
    const file = getFilePath(fileName);
    try {
      const stream = createReadStream(file);
      const hash = createHash('sha256', file);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => console.log(hash.digest('hex')));
      await finished(stream);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  compress = async ([fromFileName, toFilePath]) => {
    const fromFile = getFilePath(fromFileName);
    const toFile = getFilePath(basename(fromFile) + '.br', toFilePath);
    try {
      const source = createReadStream(fromFile)
      const destination = createWriteStream(toFile)
      const brotli = createBrotliCompress()
      await pipeline(source, brotli, destination);
    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
  decompress = async ([fromFileName, toFilePath]) => {
    const fromFile = getFilePath(fromFileName);
    const toFile = getFilePath(basename(fromFile).replace('.br', ''), toFilePath);
    try {
      const source = createReadStream(fromFile)
      const destination = createWriteStream(toFile)
      const brotli = createBrotliDecompress()
      await pipeline(source, brotli, destination);

    } catch (error) {
      console.log(`${this.defaultError} ${error.message.replace('ENOENT:', '')}`);
    }
  }
};

export default Browser;