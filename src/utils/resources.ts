const IMAGE_PREFEX = "/img/cards";
const BOXES_IMAGE_PREFEX = "/img/boxes";
const RULE_PDF_PREFEX = "/rules";

export function getCardImageUrl(cardId: string) {
  return `${IMAGE_PREFEX}/${cardId}.jpg`;
}

export function getSetImageUrl (ruleimage: string) {
    return `${BOXES_IMAGE_PREFEX}/${ruleimage}.jpg`;
}

export function getRulebookUrl (setname: string ) {
  return `${RULE_PDF_PREFEX}/${setname}.pdf`;
}