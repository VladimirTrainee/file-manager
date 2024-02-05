import { getFilePath, defaultError } from "./basic.js";
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { basename } from "node:path";
import { createReadStream, createWriteStream } from "node:fs";

const compress = async ([fromFileName, toFilePath]) => {
  const fromFile = getFilePath(fromFileName);
  const toFile = getFilePath(basename(fromFile) + '.br', toFilePath);
  try {
    const source = createReadStream(fromFile)
    const destination = createWriteStream(toFile)
    const brotli = createBrotliCompress()
    await pipeline(source, brotli, destination);
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const decompress = async ([fromFileName, toFilePath]) => {
  const fromFile = getFilePath(fromFileName);
  const toFile = getFilePath(basename(fromFile).replace('.br', ''), toFilePath);
  try {
    const source = createReadStream(fromFile)
    const destination = createWriteStream(toFile)
    const brotli = createBrotliDecompress()
    await pipeline(source, brotli, destination);

  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}

export { compress, decompress };