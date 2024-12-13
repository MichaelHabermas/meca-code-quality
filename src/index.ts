import path from 'path';
import os from 'os';

console.log(`Platform: ${os.platform()}`);
console.log(`CPU Architecture: ${os.arch()}`);
console.log(`Home Directory: ${os.homedir()}`);

const filePath = path.join(__dirname, 'example', 'file.txt');
console.log(`File Path: ${filePath}`);
