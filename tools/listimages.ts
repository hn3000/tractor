
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';

if (process.argv.length < 3) {
  console.log("usage: node listdir.js <dir>");
}

const dir = path.join(process.cwd(), process.argv[2]);
fs.readdir(dir, handleDir);

function handleDir(error: any, filenames: string[]) {
  if (error) {
    console.log('can not read folder: ', error);
    console.log('cwd:', process.cwd());
  } else {
    const names = filenames.filter(x => x.match(/.(jpg|jpeg)/i));
    const json = JSON.stringify(names, null, 2);
    console.log(json);
  }
}