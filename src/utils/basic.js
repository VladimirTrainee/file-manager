
import process from 'node:process';
import { resolve, join, parse } from "node:path";
import { stat } from "node:fs";

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
const getFileType = async (fileName) => {
  let result = true;
  try {
    result = await new Promise((resolve, reject) => {
      stat(fileName, (err, stats) => {
        if (err) reject();
        resolve(stats?.isFile())
      });
    });
  } catch {}
  return result;
}
const setDir = (dir) => process.chdir(dir);
const setParentDir = () => {
  const dir = getWorkingDir();
  const dirPath = parse(dir).dir;
  setDir(dirPath);
};
const defaultError = 'Operation failed:';
export {
  getParam,
  getText,
  getInput,
  getAction,
  exit,
  getWorkingDir,
  getFilePath,
  getFileType,
  setDir,
  setParentDir,
  defaultError,
};