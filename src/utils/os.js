import { defaultError } from "./basic.js";
import os from 'node:os';

const OS = ([param]) => {
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
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}

export default OS;