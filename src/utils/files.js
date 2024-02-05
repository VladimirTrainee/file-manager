import { getFilePath, defaultError } from "./basic.js";
import { finished } from 'node:stream/promises';
import { EOL } from 'node:os';
import { ReadStream, WriteStream } from "node:fs";
import { rename, unlink } from "node:fs/promises";

const cat = async ([fileName]) => {
  try {
    const file = getFilePath(fileName);
    const stream = new ReadStream(file, { encoding: 'utf-8' });
    stream.pipe(process.stdout);
    await finished(stream);
    console.log(EOL);
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const add = async ([fileName]) => {
  try {
    const file = getFilePath(fileName);
    const stream = new WriteStream(file, { encoding: 'utf-8' });
    stream.close();
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const rn = async ([oldFileName, newFileName]) => {
  try {
    const oldFile = getFilePath(oldFileName);
    const newFile = getFilePath(newFileName);
    await rename(oldFile, newFile);
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const cp =  async ([fromFileName, toFileName]) => {
  try {
    const fromFile = getFilePath(fromFileName);
    const toFile = getFilePath(toFileName);
    const readStream = new ReadStream(fromFile, { encoding: 'utf-8' });
    const writeStream = new WriteStream(toFile, { encoding: 'utf-8' });
    readStream.pipe(writeStream);
    await finished(readStream, writeStream)
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const mv = async ([fromFileName, toFileName]) => {
  try {
    const fromFile = getFilePath(fromFileName);
    const toFile = getFilePath(toFileName);
    const readStream = new ReadStream(fromFile, { encoding: 'utf-8' });
    const writeStream = new WriteStream(toFile, { encoding: 'utf-8' });
    readStream.pipe(writeStream);
    await finished(readStream, writeStream);
    if (fromFileName !== toFileName) await unlink(fromFileName);
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const rm = async([fileName]) => {
  try {
    const file = getFilePath(fileName);
    await unlink(file);
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}

export { cat, add, rn, cp, mv, rm };