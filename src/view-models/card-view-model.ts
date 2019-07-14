/// <reference path="../../typings/jquery.imgpreload.d.ts" />
import * as ko from "knockout";
import * as $ from "jquery";
import {Card} from "../dominion/card";
import {DominionSets} from "../dominion/dominion-sets";
import {Page} from "../pages/page";
import {SetId} from "../dominion/set-id";
import {SetViewModel} from "./set-view-model";


const IMAGE_PREFEX = "/img/cards";

export class CardViewModel {
  static ANIMATION_TIME = 600;
  static VERTICAL_LOADING_IMAGE_URL = "/img/cards/backside_blue.jpg";
  static HORIZONTAL_LOADING_IMAGE_URL = "/img/cards/backside_blue_horizontal.jpg";

  readonly id: KnockoutObservable<string | null>;
  readonly setId: KnockoutObservable<SetId | null>;
  readonly name: KnockoutObservable<string | null>;
  readonly setName: KnockoutObservable<string | null>;
  readonly isLoading: KnockoutObservable<boolean>;
  readonly isCardImageLoaded: KnockoutObservable<boolean>;
  readonly isSelected: KnockoutObservable<boolean>;
  readonly imageUrl: KnockoutObservable<string>;
  readonly setClass: KnockoutComputed<string>;
  animationStartTime: number | null;
  cardIdBeingLoaded: string | null;

  constructor(readonly parent: Page, readonly isVertical: boolean) {
    this.id = ko.observable(null);
    this.setId = ko.observable(null);
    this.name = ko.observable(null);
    this.setName = ko.observable(null);
    this.isLoading = ko.observable(true);
    this.isCardImageLoaded = ko.observable(false);
    this.isSelected = ko.observable(false);
    this.animationStartTime = null;
    this.cardIdBeingLoaded = null;

    // Build the image URL.
    this.imageUrl = ko.observable(this.getLoadingImageUrl());
    this.setClass = ko.pureComputed(() => {
      return this.isLoading() ? "loading" : this.setId() as string;
    });
  }

  setCard(card: Card) {
    this.cardIdBeingLoaded = card.id;
    const cardIdBeingLoadedByFn = card.id;
    const imageUrl = `${IMAGE_PREFEX}/${card.id}.jpg`;
    
    this.isCardImageLoaded(false);
    $.imgpreload(imageUrl, () => {
      // Delay showing image until transition is complete.
      const animationStartTime = this.animationStartTime || 0;
      const timeRemaining = CardViewModel.ANIMATION_TIME - (Date.now() - animationStartTime);
      if (timeRemaining >= 0) {
        setTimeout(() => this.setCardInternal(card, imageUrl), timeRemaining);
      } else {
        this.setCardInternal(card, imageUrl);
      }
    });
  }

  private setCardInternal(card: Card, imageUrl: string) {
    // Don't do anything if the card data has changed since loading started.
    if (card.id != this.cardIdBeingLoaded) {
      return;
    }
    this.id(card.id);
    this.name(card.name);
    this.setId(card.setId);
    this.setName(DominionSets.getSetById(card.setId).name);
    this.imageUrl(imageUrl);
    this.isLoading(false);
    this.isCardImageLoaded(true);
  }

  setToLoading() {
    this.isSelected(false);
    this.isLoading(true);
    this.animationStartTime = Date.now();
  }
  
  toggleSelected() {
    this.isSelected(!this.isSelected());
  }

  private getLoadingImageUrl() {
    return this.isVertical
        ? CardViewModel.VERTICAL_LOADING_IMAGE_URL
        : CardViewModel.HORIZONTAL_LOADING_IMAGE_URL;
  }
}
