const path = require('path');
const loaderUtils = require('loader-utils');
const utils = require('./utils');

module.exports = function(source) {
  const options = loaderUtils.getOptions(this);
  const files = utils.findFilesFromDirectory(path.resolve(__dirname, "../sets"));
  for (var i = 0; i < files.length; i++) {
    this.addDependency(files[i]);
  }
  const sets = utils.loadSets();
  return "export default " +  JSON.stringify(sets);
}
