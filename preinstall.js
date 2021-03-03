#!/usr/bin/env node

console.log("==== Starting uilicious-cli install setup ====");

/**
 * Node JS wrapper for Uilicious CLI installation
 */

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

// The following help check if the platform is alpine (guessing using apk)
// to help better differentiate the linux dependency
function isAlpine() {
    const output = require('child_process').spawnSync('which',['apk']).stderr.toString('utf8');
    if(output.indexOf('apk') > -1) {
        return true;
    }
    return false;
}

// Get the bin executable path
// Binary name on Windows has .exe suffix
let binName = null
if(process.platform === "darwin") {
	binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-macos-64bit/uilicious-cli-macos-64bit");
} else if(process.platform === "win32") {
	binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-windows-64bit/uilicious-cli-win-64bit.exe");
} else if(process.platform === "linux") {
	if( isAlpine() ) {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-alpine-64bit/uilicious-cli-alpine-64bit");
	} else {
		binName = path.join(scriptDirectory, "/node_modules/@uilicious/cli-linux-64bit/uilicious-cli-linux-64bit");
	}
}

// Check if the file exist
if( !fs.existsSync(binName) ) {
	throw "!!! FATAL ERROR : Missing expected dependency file: "+binName;
}

// The final binary file to overwrite (which is define by this package.json)
// its intentionally a .exe file, so that this same path can be supported in windows and linux
const finalBinaryPath = "./uilicious-cli-dist.exe";

try {
	// Lets write the file over
	fs.writeFileSync(finalBinaryPath, fs.readFileSync(binName, { encoding : null }), { encoding : null });
} catch(e) {
	if( process.platform  == "win32" ) {
		throw "!!! FATAL ERROR : Failed to copy the binary file for windows based install - consider downloading the binary directly from github instead - https://github.com/uilicious/uilicious-cli"
	}
	console.log("NOTE: Failed to perform binary copy for uilicious-cli due to permission issues, falling back to bash script wrapper (this requires `bash,ls,sed` to be installed)")
}

// Copy over the file
// fs.copyFileSync(binName, finalBinaryPath, fs.constants.COPYFILE_FICLONE);

// // Lets ensure the execution performance
// if( process.platform !== "win32" ) {
// 	fs.chmodSync(finalBinaryPath, 777);
// }

// Ending log
console.log("==== Completed uilicious-cli install setup ====");
console.log("-------------------------------------------------------------------------------");
console.log("To access our CLI help logs, use `uilicious-cli --help`")
console.log("PS: You can safely ignore all the 'SKIPPING OPTIONAL DEPENDENCY' warnings below");
console.log("-------------------------------------------------------------------------------");

