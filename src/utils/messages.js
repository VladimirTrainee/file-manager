import { getText, getWorkingDir } from './basic.js';

const message = (text = 'Invalid input') => console.log(text);
const error = () => message();
const welcome = (username) => message(getText('Welcome to the File Manager, $1!', username));
const bye = (username) => message(getText('Thank you for using File Manager, $1, goodbye!', username));
const showPath = () => {
    message('You are currently in path_to_working_directory');
    message(getWorkingDir());
  }
export { message, error, welcome, bye, showPath };