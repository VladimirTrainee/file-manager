import process from 'node:process';
import {
  getParam,
  getInput,
  exit,
  setDir,
} from './basic.js';

import { message, error, welcome, bye, showPath } from './messages.js';
import { up, cd, ls } from './dir.js';
import { cat, add, rn, cp, mv, rm } from './files.js';
import OS from './os.js'; 
import hash from './hash.js';
import { compress, decompress } from './compress.js';

class Browser {
  constructor() {
    this.username = getParam('username') || 'username';
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

  message = message;
  error = error;
  welcome = () => welcome(this.username);
  bye = () => bye(this.username);
  showPath = showPath;
  
  up = up;
  cd = cd;
  ls = ls;
  cat = cat;
  add = add;
  rn = rn;
  cp = cp;
  mv = mv;
  rm = rm;
  os = OS;
  hash = hash;
  compress = compress;
  decompress = decompress;
  
};

export default Browser;