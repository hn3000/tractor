"use strict";
exports.__esModule = true;
var fs = require("fs");
var process = require("process");
var path = require("path");
if (process.argv.length < 3) {
    console.log("usage: node listdir.js <dir>");
}
var dir = path.join(process.cwd(), process.argv[2]);
fs.readdir(dir, handleDir);
function handleDir(error, filenames) {
    if (error) {
        console.log('can not read folder: ', error);
        console.log('cwd:', process.cwd());
    }
    else {
        var names = filenames.filter(function (x) { return x.match(/.(jpg|jpeg)/i); });
        var json = JSON.stringify(names, null, 2);
        console.log(json);
    }
}
