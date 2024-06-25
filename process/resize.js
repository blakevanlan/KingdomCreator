import sharp from 'sharp'; 

function resize(filename, output) {
  const options =
    isHorizontal(filename)
      ? {
        height:296,
        width:473,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      } : { 
        height:473,
        width:296,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      };

  return sharp(filename).resize(options).toFile(output);
}

function isHorizontal(name) {
  const horizontal = [
    "_event_",
    "_landmark_",
    "_project_",
    "_boon_",
    "_war_",
    "_way_",
    "_ally_",
    "_trait_"
  ]
  for (let i = 0; i < horizontal.length; i++) {
    if (name.indexOf(horizontal[i]) != -1) {
      return true;
    }
  }
  return false;
}

export default resize;
