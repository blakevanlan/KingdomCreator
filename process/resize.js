import sharp from 'sharp'; 
import fs from 'fs/promises'; // Using promises for async/await

const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical'

async function resize(inputFilename, imageType, outputFilename, imageId='') {
  console.log("resize", inputFilename, imageType, outputFilename, imageId)
  let imageSharp = sharp(inputFilename);

  // Obtenir les dimensions de l'image
  const { width, height } = await imageSharp.metadata();
  let newHeight, newWidth;
  let extractLeftOffset=0, extractTopOffset=0;

  // Définir les ratios par défaut et les options de redimensionnement
  const Ratios = { // width, height
    CardImage: { horizontal: [473, 296], vertical: [296, 473] },
    CardArtwork: { horizontal: [452, 177], vertical: [287, 209] }
  };
  let Options = { //option for resize 
    CardImage: { fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 1 },
        quality : 100
      },
    CardArtwork: { fit: 'cover',
        withoutEnlargement: true,
        withoutReduction: true,
        quality: 100,
      }
  };

  // Déterminer la direction de l'image en fonction du nom du fichier
  const isIimageDirection = isHorizontal(imageId ? imageId : inputFilename);

  // Calculer les nouvelles dimensions en fonction du ratio souhaité et des dimensions de l'image
  if (Ratios[imageType][isIimageDirection][1]*width/Ratios[imageType][isIimageDirection][0] >= height) {
    newHeight = height
    newWidth = Math.floor(
          height * Ratios[imageType][isIimageDirection][0]/
          Ratios[imageType][isIimageDirection][1])
    extractLeftOffset= Math.floor((width - newWidth+1)/2)    
  } else {
    newWidth= width
    newHeight = Math.floor(
          width * Ratios[imageType][isIimageDirection][1]/
          Ratios[imageType][isIimageDirection][0])
    extractTopOffset = Math.floor((height - newHeight+1)/2)
  }
  let mergedOptions
  if (inputFilename.includes('Tanuki'))
  {
    mergedOptions = {
      position: 'top',
      height: newHeight,
      width: newWidth,
      ...Options[imageType]
    }
  } else {
    mergedOptions = {
      height: newHeight,
      width: newWidth,
      ...Options[imageType]
    };
  }
  await imageSharp.resize(mergedOptions).toFile(outputFilename);
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
    "_trait_",
    "_prophecy_",
    "_Hexes_", "_States_",
    "_Artifacts_"
  ]
  for (let i = 0; i < horizontal.length; i++) {
    if (name.indexOf(horizontal[i]) != -1) {
      return HORIZONTAL;
    }
  }
  return VERTICAL;
}

export default resize;


