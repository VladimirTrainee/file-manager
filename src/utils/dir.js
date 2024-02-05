import { getFilePath, defaultError, getWorkingDir, getFileType, setParentDir, setDir } from "./basic.js";
import { readdir } from "node:fs/promises";

const up = () => {
  try {
    setParentDir();
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }
}
const cd = ([dir]) => {
  try {
    setDir(dir);
  } catch (error) {
    console.log(`${defaultError} ${error.message.replace('ENOENT:', '')}`);
  }  
}

const ls = async () => {
  const files = await readdir(getWorkingDir(), { withFileTypes: true })
  let result = [];
  for (let file of files) {
    const Name = file.name;
    const fileName = getFilePath(file.name, file.path);
    let isFile = await getFileType(fileName);
    const Type = isFile ? 'file' : 'directory';
    result.push( { Name, Type });

  } 
  console.table(result);
}

export { up, cd, ls };