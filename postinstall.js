#!/usr/bin/env node

console.log("==== Starting uilicious-cli install setup ====");

/**
 * Node JS wrapper for Uilicious CLI installation
 */

// Load the shelljs module
const shell = require('shelljs');

// NPM path
const fs = require('fs');
const path = require('path');

// Process and argument path handling
const currentWorkingDirectory = process.cwd();
const nodeBinary = process.argv[0];
const executedFile = process.argv[1];
const arguments = process.argv.slice(2);  

// Script filename, and script directory
const scriptFilePath = __filename;
const scriptDirectory = __dirname;

// Mapping from Node's `process.arch` to Golang's `$GOARCH`
const ARCH_MAPPING = {
	"ia32": "386",
	"x64": "amd64"
};

// Mapping between Node's `process.platform` to Golang's 
const PLATFORM_MAPPING = {
	 "darwin": "darwin",
	 "linux": "linux",
	 "win32": "windows"
};

if (!(process.arch in ARCH_MAPPING)) {
	console.error("Uilicious-CLI is not supported for this architecture: " + process.arch);
	return;
}

if (!(process.platform in PLATFORM_MAPPING)) {
	console.error("Uilicious-CLI is not supported for this platform: " + process.platform);
	return
}

// Get the bin executable path
// Binary name on Windows has .exe suffix
var binName = null
if(process.platform === "darwin") {
	if(process.arch === "x64") {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-macos-64bit/uilicious-cli-macos-64bit");
	} else {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-macos-32bit/uilicious-cli-macos-32bit");
	}
} else if(process.platform === "win32") {
	if(process.arch === "x64") {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-windows-64bit/uilicious-cli-win-64bit.exe");
	} else {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-windows-32bit/uilicious-cli-win-32bit.exe");
	}
} else if(process.platform === "linux") {
	if(process.arch === "x64") {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-linux-64bit/uilicious-cli-linux-64bit");
	} else {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-linux-32bit/uilicious-cli-linux-32bit");
	}
}

// Lets write the file over
fs.writeFileSync("./uilicious-cli-dist.exe", fs.readFileSync(binName, { encoding : null }), { encoding : null });

// Ending log
console.log("==== Completed uilicious-cli install setup ====");