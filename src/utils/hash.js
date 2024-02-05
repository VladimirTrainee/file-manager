import { getFilePath, defaultError } from "./basic.js";
import { createReadStream } from "node:fs";
import { createHash } from 'node:crypto';
import { finished } from 'node:stream/promises';

const hash = async ([fileName]) => {
  const file = getFilePath(fileName);
  try {
    const stream = createReadStream(file);
    const hash = createHash('sha256', file);
    stream.on('data', (data) => hash.update(data));
    await finished(stream);
    console.log(hash.digest('hex'));
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
export default hash;