#!/usr/bin/env node

const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');
const pug = require('pug');
const setLoader = require('./utils/set-loader');

const connectAssetsExecutable = path.join(__dirname, 'node_modules/.bin/connect-assets');

// Compile JavaScript and CSS.
childProcess.execFileSync(connectAssetsExecutable, {stdio: [0, 1, 2]})

// Copy over the files (and rename).
const assetPath = path.join(__dirname, 'builtAssets');
const docsPath = path.join(__dirname, 'docs');

const manifest = require(path.join(assetPath, 'manifest.json'))
const filenamesNeeded = ['site.js', 'main.css']

for (var i = 0; i < filenamesNeeded.length; i++) {
   var filename = filenamesNeeded[i]
   var actualFilename = manifest.assets[filename];
   var from = path.join(assetPath, actualFilename)
   var to = path.join(docsPath, filename)
   fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

// Load all the sets.
const sets = setLoader.loadSets();

// Create index.html from pug templates.
const pugTemplate = path.join(__dirname, 'views/home.pug');
const html = pug.renderFile(pugTemplate, {
   filename: pugTemplate,
   basedir: path.join(__dirname, 'views'),
   css: function(file) {
      return '<link rel="stylesheet" href="' + file + '.css">';
   },
   js: function(file) {
      return '<script src="' + file + '.js"></script>';
   },
   sets: sets,
   isProduction: true
});
const indexFilename = path.join(docsPath, 'index.html');
fs.writeFileSync(indexFilename, html)
