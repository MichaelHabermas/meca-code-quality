"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
console.log(`Platform: ${os_1.default.platform()}`);
console.log(`CPU Architecture: ${os_1.default.arch()}`);
console.log(`Home Directory: ${os_1.default.homedir()}`);
const filePath = path_1.default.join(__dirname, 'example', 'file.txt');
console.log(`File Path: ${filePath}`);
