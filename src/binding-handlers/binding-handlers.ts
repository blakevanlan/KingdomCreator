import {bindCardImage} from "./card-image";
import {bindDominionSetName} from "./dominion-set-name";
import {bindDominionSetNames} from "./dominion-set-names";
import {bindFadeIn} from "./fade-in";
import {bindScaleOffWidthOfImage} from "./scale-off-width-of-image";
import {bindShowFloating} from "./show-floating";
import {bindShowMenu} from "./show-menu";
import {bindSlideVisible} from "./slide-visible";
import {bindWithCard} from "./with-card";

export function initializeBindingHandlers() {
  bindCardImage();
  bindDominionSetName();
  bindDominionSetNames();
  bindFadeIn();
  bindScaleOffWidthOfImage();
  bindShowFloating();
  bindShowMenu();
  bindSlideVisible();
  bindWithCard();
}
