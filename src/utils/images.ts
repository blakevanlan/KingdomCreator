const IMAGE_PREFIX = "/img/cards";
const BOXES_IMAGE_PREFIX = "/img/boxes";


export function getCardImageUrl(cardId: string) {
  return `${IMAGE_PREFIX}/${cardId}.jpg`;
}


export function getRuleImageUrl(ruleimage: string) {
  return `${BOXES_IMAGE_PREFIX}/${ruleimage}`;
}