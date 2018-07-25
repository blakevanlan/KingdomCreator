#!/usr/bin/env node

const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');
const pug = require('pug');
const Loader = require('./utils/loader');

const connectAssetsExecutable = path.join(__dirname, 'node_modules/.bin/connect-assets');

// Compile JavaScript and CSS.
childProcess.execFileSync(connectAssetsExecutable, {stdio: [0, 1, 2]})

// Copy over the files (and rename).
const assetPath = path.join(__dirname, 'builtAssets');
const docsPath = path.join(__dirname, 'docs');

// All of the pages.
const pageNames = [
   'index',
   'sets',
];

const manifest = require(path.join(assetPath, 'manifest.json'))

const filenamesNeeded = ['main.css'];
for (var i = 0; i < pageNames.length; i++) {
   filenamesNeeded.push(pageNames[i] + '.js', pageNames[i] + '.css');
}

for (var i = 0; i < filenamesNeeded.length; i++) {
   var filename = filenamesNeeded[i]
   var actualFilename = manifest.assets[filename];
   var from = path.join(assetPath, actualFilename)
   var to = path.join(docsPath, filename)
   fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

// Load all the sets.
const sets = Loader.loadSets();
const kingdoms = Loader.loadKingdoms();
const now = Date.now()

// Create html files from pug templates.
for (var i = 0; i < pageNames.length; i++) {
   var pugTemplate = path.join(__dirname, 'views', pageNames[i] + '.pug'); 
   var html = pug.renderFile(pugTemplate, {
      filename: pugTemplate,
      basedir: path.join(__dirname, 'views'),
      css: function(file) {
         return '<link rel="stylesheet" href="' + file + '.css?' + now +'">';
      },
      js: function(file) {
         return '<script src="' + file + '.js?' + now +'"></script>';
      },
      sets: sets,
      kingdoms: kingdoms,
      isProduction: true
   });
   var filename = path.join(docsPath, pageNames[i] + '.html');
   fs.writeFileSync(filename, html);
}
