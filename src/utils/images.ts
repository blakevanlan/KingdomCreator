const IMAGE_PREFEX = "/img/cards";

export function getCardImageUrl(cardId: string) {
  return `${IMAGE_PREFEX}/${cardId}.jpg`;
}