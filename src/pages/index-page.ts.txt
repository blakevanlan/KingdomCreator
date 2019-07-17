/// <reference path="../../typings/jquery.imgpreload.d.ts" />
import * as ko from "knockout";
import * as $ from "jquery";
import {Addon} from "../dominion/addon";
import {Cards} from "../utils/cards";
import {CardType} from "../dominion/card-type";
import {CardViewModel} from "../view-models/card-view-model";
import {DialogViewModel} from "../view-models/dialog-view-model";
import {DominionSets} from "../dominion/dominion-sets";
import {EventTracker} from "../analytics/event-tracker";
import {EventType} from "../analytics/event-tracker";
import {Event} from "../dominion/event";
import {Kingdom} from "../models/kingdom";
import {Landmark} from "../dominion/landmark";
import {MenuItem} from "./page";
import {MetadataViewModel} from "../view-models/metadata-view-model";
import {Page} from "./page";
import {Project} from "../dominion/project";
import {RandomizerOptionsBuilder} from "../randomizer/randomizer-options";
import {RandomizerSettings} from "../settings/randomizer-settings";
import {Randomizer} from "../randomizer/randomizer";
import {SetId} from "../dominion/set-id";
import {Settings} from "../settings/settings";
import {SetViewModel} from "../view-models/set-view-model";
import {SortOption} from "../settings/settings";
import {Supply} from "../models/supply";
import {SupplyCard} from "../dominion/supply-card";
import {getMessageForAddonsDescription} from "../utils/messages";
import {deserializeKingdom, serializeKingdom} from "../randomizer/serializer";
import {loadSettings, saveSettings} from "../settings/settings-manager";

const MIN_SETS_FOR_PRIORITIZE_OPTION = 3;
const MIN_CARDS_FOR_DISTRIBUTE_COST = 24;
const SUBTITLE = "Dominion card picker for desktop and mobile"

interface NamedValue {
  name: string;
  value: string;
}

interface CardMoveDescriptor {
  card: CardViewModel;
  element: JQuery<HTMLElement>;
  moveFrom?: JQuery.Coordinates;
  moveTo?: JQuery.Coordinates;
}

export class IndexPage extends Page {
  private kingdom: Kingdom | null;
  readonly sets: KnockoutObservableArray<SetViewModel>;
  readonly supplyCards: KnockoutObservableArray<CardViewModel>;
  readonly addons: KnockoutObservableArray<CardViewModel>;
  readonly isDistributeCostAllowed: KnockoutComputed<boolean>;
  readonly isPrioritizeSetEnabled: KnockoutObservable<boolean>;
  readonly isPrioritizeSetAllowed: KnockoutComputed<boolean>;
  readonly prioritizeSetOptions: KnockoutComputed<NamedValue[]>;
  readonly settings: Settings;
  readonly randomizerSettings: RandomizerSettings;
  readonly isEnlarged: KnockoutObservable<boolean>;
  readonly metadata: MetadataViewModel;
  readonly dialog: DialogViewModel;
  readonly hasLoaded: KnockoutObservable<boolean>;
  readonly showAddons: KnockoutComputed<boolean>;
  readonly addonsHeader: KnockoutComputed<string>;
  readonly randomizeButtonText: KnockoutComputed<string>;

  constructor() {
    super(SUBTITLE, MenuItem.RANDOMIZER);
    this.kingdom = null;
    this.sets = ko.observableArray(this.createSetViewModels());
    this.supplyCards = ko.observableArray(this.createCardViewModels(10, true));
    this.addons = ko.observableArray(this.createCardViewModels(2, false));
    this.isDistributeCostAllowed = this.createIsDistributeCostAllowedObservable();
    this.isPrioritizeSetEnabled = ko.observable(false);
    this.isPrioritizeSetAllowed = this.createIsPrioritizeSetAllowedObservable();
    this.isPrioritizeSetAllowed.subscribe(() => this.isPrioritizeSetAllowedChanged());
    this.prioritizeSetOptions = this.createPrioritizeSetOptionsObservable();
    
    // Load settings from cookie and initialize.
    this.settings = loadSettings();
    this.randomizerSettings = this.settings.randomizerSettings();
    this.initializeSettings();

    this.isEnlarged = ko.observable(false);
    this.metadata = new MetadataViewModel();
    this.dialog = new DialogViewModel();
    this.hasLoaded = ko.observable(false);
    this.showAddons = this.createShowAddonsObservable();
    this.addonsHeader = this.createAddonsHeaderObservable();
    this.randomizeButtonText = this.createRandomizeButtonTextObservable();
  }

  loadInitialKingdom(): void {
    this.loadCardBacks();

    const kingdomFromUrl = deserializeKingdom(location.search);
    if (kingdomFromUrl) {
      // Use the kingdom as-is if it contains 10 supply cards.
      if (kingdomFromUrl.supply.supplyCards.length == 10) {
        EventTracker.trackEvent(EventType.LOAD_FULL_KINGDOM_FROM_URL);
        this.setKingdom(kingdomFromUrl);
        return;
      }
      // Randomize the rest of the set if there are less than 10 cards.
      const options =
          this.createRandomizerOptionsBuilder()
              .setSetIds(this.getSelectedSetIds())
              .setExcludeTypes(this.getExcludeTypes())
              .setIncludeCardIds(Cards.extractIds(kingdomFromUrl.supply.supplyCards))
              .build();
        
      const supply = Randomizer.createSupplySafe(options);
      if (supply) {
        EventTracker.trackEvent(EventType.LOAD_PARTIAL_KINGDOM_FROM_URL);
        const kingdom = new Kingdom(
            supply, kingdomFromUrl.events, kingdomFromUrl.landmarks, kingdomFromUrl.projects,
            kingdomFromUrl.metadata);
        this.setKingdom(kingdom);
        return;
      } else {
        EventTracker.trackError(EventType.LOAD_PARTIAL_KINGDOM_FROM_URL);
      }
    }

    this.randomize();
  }

  randomize(): void {
    const selectedCards = this.getSelectedCards();
    const isAddonSelected = 
        this.getSelectedEvents().length ||
        this.getSelectedLandmarks().length ||
        this.getSelectedProjects().length ||
        this.getSelectedUndefinedAddons().length;

    if (!selectedCards.length && !isAddonSelected) {
      this.randomizeFullKingdom();
      return;
    }

    // Show a dialog for customizing when randomizing a single card for specifying the card.
    if (selectedCards.length == 1 && !isAddonSelected) {
      this.dialog.open(
          this.getSelectedSets().map((set) => set.setId),
          () => this.randomizeIndividualSelectedCard());
      return;
    }
    
    if (selectedCards.length) {
      this.randomizeSelectedCards();
    }

    if (isAddonSelected) {
      this.randomizeSelectedAddons();
    }
  }

  private randomizeFullKingdom() {
    const setIds = this.getSelectedSetIds();
    if (!setIds.length) {
      return;
    }
    this.supplyCards().forEach((card) => card.setToLoading());
    this.addons().forEach((card) => card.setToLoading());

    const options = this.createRandomizerOptionsBuilder()
      .setSetIds(setIds)
      .setExcludeCardIds(this.getCardsToExclude())
      .setExcludeTypes(this.getExcludeTypes())
      .build();

    // Reset the dialog options whenever the full kingdom is randomized.
    this.dialog.resetOptions();

    try {
      this.setKingdom(Randomizer.createKingdom(options));
      EventTracker.trackEvent(EventType.RANDOMIZE_KINGDOM);
    } catch (e) {
      EventTracker.trackError(EventType.RANDOMIZE_KINGDOM);
    }
    this.saveSettings();
  }

  private randomizeSelectedCards() {
    const options = this.createRandomizerOptionsBuilder()
      .setSetIds(this.getSelectedSetIds())
      .setIncludeCardIds(this.extractCardIds(this.getUnselectedCards()))
      .setExcludeCardIds(this.extractCardIds(this.getSelectedCards()))
      .setExcludeTypes(this.getExcludeTypes())
      .build();

    const supply = Randomizer.createSupplySafe(options);
    if (supply) {
      EventTracker.trackEvent(EventType.RANDOMIZE_MULTIPLE);
      this.replaceSelectedCardsWithSupply(supply);
    } else {
      EventTracker.trackError(EventType.RANDOMIZE_MULTIPLE);
    }
  }

  private randomizeSelectedAddons() {
    const selectedAddons =
        this.getSelectedEvents().concat(this.getSelectedLandmarks(), this.getSelectedProjects());
    const newAddonsCount = selectedAddons.length + this.getSelectedUndefinedAddons().length;
    
    const setIds = this.getSelectedSetIds();
    const selectedAddonIds = this.extractCardIds(selectedAddons);
    
    const newAddons =
        Randomizer.getRandomAddons(setIds, selectedAddonIds, newAddonsCount);
    this.replaceSelectedAddons(newAddons);
    EventTracker.trackEvent(EventType.RANDOMIZE_EVENTS_AND_LANDMARKS);
  }
    
  private randomizeIndividualSelectedCard() {
    const excludeTypes: CardType[] = [];
    if (this.dialog.selectedType() && !this.randomizerSettings.allowAttacks()) {
      excludeTypes.push(CardType.ATTACK);
    }
    const setIds: SetId[] = this.dialog.selectedSetId() == DialogViewModel.ALL_OPTION_ID
        ? this.getSelectedSetIds()
        : [this.dialog.selectedSetId() as SetId];
    const optionsBuilder = new RandomizerOptionsBuilder()
      .setSetIds(setIds)
      .setIncludeCardIds(this.extractCardIds(this.getUnselectedCards()))
      .setExcludeCardIds(this.extractCardIds(this.getSelectedCards()))
      .setExcludeTypes(excludeTypes)
      .setExcludeCosts(
          this.dialog.costs.filter((cost) => !cost.isActive()).map((cost) => cost.id));

    // Either set a specific card type or add supply card requirements if one isn't selected.
    if (this.dialog.selectedType() != DialogViewModel.ALL_OPTION_ID) {
      optionsBuilder.setRequireSingleCardOfType(this.dialog.selectedType() as CardType);
    } else {
      optionsBuilder
        .setRequireActionProvider(this.randomizerSettings.requireActionProvider())
        .setRequireCardProvider(this.randomizerSettings.requireCardProvider())
        .setRequireBuyProvider(this.randomizerSettings.requireBuyProvider())
        .setRequireTrashing(this.randomizerSettings.requireTrashing())
        .setRequireReactionIfAttacks(this.randomizerSettings.requireReaction())
    }
    
    const supply = Randomizer.createSupplySafe(optionsBuilder.build());
    if (supply) {
      EventTracker.trackEvent(EventType.RANDOMIZE_SINGLE);
      this.replaceSelectedCardsWithSupply(supply);
    } else {
      EventTracker.trackError(EventType.RANDOMIZE_SINGLE);
    }
  }

  private replaceSelectedCardsWithSupply(supply: Supply) {
    const selectedCards = this.getSelectedCards();
    const nonSelectedCardIds = this.extractCardIds(this.getUnselectedCards());
    
    // Set cards to loading and get the new cards.
    selectedCards.forEach((card) => card.setToLoading());

    this.kingdom = new Kingdom(
        supply, this.kingdom!.events, this.kingdom!.landmarks, this.kingdom!.projects,
        this.kingdom!.metadata);
    this.updateUrlForKingdom(this.kingdom);
    let imagesLeftToLoad = selectedCards.length;
    
    // Use this function to sync all of the images so that the sort only happens after all have
    // loaded.
    const registerComplete = () => {
      if (--imagesLeftToLoad <= 0) {
        setTimeout(()=> this.sortCards(), CardViewModel.ANIMATION_TIME);
      }
    };
    
    const setSupplyCard = (card: CardViewModel, supplyCard: SupplyCard) => {
      card.setCard(supplyCard);
      if (card.isCardImageLoaded()) {
        registerComplete();
      } else {
        const subscription = card.isCardImageLoaded.subscribe((isLoaded: boolean) => {
          if (isLoaded) {
            subscription.dispose();
            registerComplete();
          }
        });
      }
    };

    let nextSelectedCardIndex = 0;
    for (let supplyCard of this.kingdom.supply.supplyCards) {
      if (nonSelectedCardIds.indexOf(supplyCard.id) == -1 &&
          nextSelectedCardIndex < selectedCards.length) {
        setSupplyCard(selectedCards[nextSelectedCardIndex++], supplyCard);
      }
    }
  }

  private replaceSelectedAddons(newAddons: Addon[]) {
    const selectedEvents = this.getSelectedEvents();
    const selectedLandmarks = this.getSelectedLandmarks();
    const selectedProjects = this.getSelectedProjects();
    const selectedUndefinedAddons = this.getSelectedUndefinedAddons();
    const selectedAddons =
        selectedEvents.concat(selectedLandmarks, selectedProjects, selectedUndefinedAddons);
    
    selectedAddons.forEach((card) => card.setToLoading());
    const nonSelectedAddonIds =
        this.addons().filter((addon) => !addon.isSelected()).map((addon) => addon.id());
    
    let nextIndex = 0;
    for (let addon of newAddons) {
      if (nonSelectedAddonIds.indexOf(addon.id) == -1 && nextIndex < selectedAddons.length) {
        selectedAddons[nextIndex++].setCard(addon);
      }
    }
    // TODO: Update the URL with the new addons.
  }

  private setKingdom(kingdom: Kingdom) {
    this.kingdom = kingdom;

    const supplyCardViewModels = this.supplyCards();
    const sortedSupplyCards =
        this.kingdom.supply.supplyCards.concat().sort((a, b) => this.supplyCardSorter(a, b));
    for (let i = 0; i < sortedSupplyCards.length; i++) {
      supplyCardViewModels[i].setCard(sortedSupplyCards[i]);
    }

    const addonViewModels = this.addons();
    const addons = (this.kingdom.events as Addon[]).concat(
        this.kingdom.landmarks as Addon[], this.kingdom.projects as Addon[]);
    for (let i = 0; i < addonViewModels.length; i++) {
      if (i < addons.length) {
        addonViewModels[i].setCard(addons[i]);
      } else {
        addonViewModels[i].setToLoading();
      }
    }
    this.metadata.update(kingdom.metadata);
    this.updateUrlForKingdom(kingdom);
  }

  toggleEnlarged() {
    this.isEnlarged(!this.isEnlarged());
  }

  private createSetViewModels(): SetViewModel[] {
    return DominionSets.getAllSets().concat().sort((a, b) => {
      if (a.name == b.name) {
        return 0;
      }
      return a.name < b.name ? -1 : 1;
    }).map((set) => new SetViewModel(set, false));
  }

  private createShowAddonsObservable() {
    return ko.pureComputed(() => {
      if (!this.hasLoaded()) {
        return false;
      }
      for (let setViewModel of this.sets()) {
        if (setViewModel.isActive()) {
          const set = DominionSets.getSetById(setViewModel.setId);
          if (set.events.length || set.landmarks.length || set.projects.length) {
            return true;
          }
        }
      }
      // Check if the current kingdom has any events or landmarks.
      for (let addonViewModel of this.addons()) {
        if (!addonViewModel.isLoading()) {
          return true;
        }
      }
      return false;
    });
  }

  private createAddonsHeaderObservable() {
    return ko.pureComputed(() => {
      let hasEvents = false;
      let hasLandmarks = false;
      let hasProjects = false;
      for (let setViewModel of this.sets()) {
        if (setViewModel.isActive()) {
          const set = DominionSets.getSetById(setViewModel.setId);
          hasEvents = hasEvents || set.events.length > 0;
          hasLandmarks = hasLandmarks || set.landmarks.length > 0;
          hasProjects = hasProjects || set.projects.length > 0;
        }
      }

      // Check if the current kingdom has any events or landmarks.
      for (let addonViewModel of this.addons()) {
        if (!addonViewModel.id()) {
          continue;
        }
        const addon = DominionSets.getCardById(addonViewModel.id()!);
        hasEvents = hasEvents || addon instanceof Event;
        hasLandmarks = hasLandmarks || addon instanceof Landmark;
        hasProjects = hasProjects || addon instanceof Project;
      }
      return getMessageForAddonsDescription(hasEvents, hasLandmarks, hasProjects);
    });
  }

  private createRandomizeButtonTextObservable() {
    return ko.pureComputed(() => {
      return this.supplyCards().concat(this.addons()).some((card) => card.isSelected())
          ? "Replace!"
          : "Randomize!";
    });
  }

  private createIsDistributeCostAllowedObservable() {
    return ko.pureComputed(() => {
      let supplyCardCount = 0
      const setIds = this.getSelectedSetIds();
      for (let setId of setIds) {
        supplyCardCount += DominionSets.getSetById(setId).supplyCards.length;
      }
      return supplyCardCount >= MIN_CARDS_FOR_DISTRIBUTE_COST;
    });
  }

  private createIsPrioritizeSetAllowedObservable() {
    return ko.pureComputed(() => {
      return this.getSelectedSetIds().length >= MIN_SETS_FOR_PRIORITIZE_OPTION;
    });
  }

  private createPrioritizeSetOptionsObservable(): KnockoutComputed<NamedValue[]> {
    return ko.pureComputed(() => {
      return this.sets()
          .filter((set) => set.isActive())
          .map((set) => ({name: set.name, value: set.setId}));
    });
  }

  private createCardViewModels(numberOfModels: number, isVertical: boolean) {
    const models: CardViewModel[] = [];
    for (let i = 0; i < numberOfModels; i++) {
      models.push(new CardViewModel(this, isVertical));
    }
    return models;
  }

  private createRandomizerOptionsBuilder() {
    return new RandomizerOptionsBuilder()
        .setRequireActionProvider(this.randomizerSettings.requireActionProvider())
        .setRequireBuyProvider(this.randomizerSettings.requireBuyProvider())
        .setRequireTrashing(this.randomizerSettings.requireTrashing())
        .setRequireReactionIfAttacks(this.randomizerSettings.requireReaction())
        .setDistributeCost(
            this.isDistributeCostAllowed() && this.randomizerSettings.distributeCost())
        .setPrioritizeSet(
            this.isPrioritizeSetAllowed() && this.isPrioritizeSetEnabled()
                ? this.randomizerSettings.prioritizeSet() 
                : null);
  }

  private initializeSettings() {
    const boundSaveSettings = () => { this.saveSettings() };
    // Set the active state of the sets.
    const selectedSets = this.settings.selectedSets();
    for (let set of this.sets()) {
      set.isActive(selectedSets.indexOf(set.setId) != -1);
      set.isActive.subscribe(boundSaveSettings);
    }

    // Setup the prirotized set option.
    this.isPrioritizeSetEnabled(!!this.randomizerSettings.prioritizeSet());
    this.isPrioritizeSetEnabled.subscribe(() => this.isPrioritizeSetEnabledChanged());
    
    // Re-sort the cards when the sort option changes.
    this.settings.sortOption.subscribe(() => this.sortCards());

    // Save the settings when settings change.
    this.settings.sortOption.subscribe(boundSaveSettings);
    this.randomizerSettings.requireActionProvider.subscribe(boundSaveSettings);
    this.randomizerSettings.requireBuyProvider.subscribe(boundSaveSettings);
    this.randomizerSettings.allowAttacks.subscribe(boundSaveSettings);
    this.randomizerSettings.requireReaction.subscribe(boundSaveSettings);
    this.randomizerSettings.requireTrashing.subscribe(boundSaveSettings);
    this.randomizerSettings.distributeCost.subscribe(boundSaveSettings);
    this.randomizerSettings.prioritizeSet.subscribe(boundSaveSettings);
  }

  private saveSettings() {
    const selectedSets = this.getSelectedSetIds();
    this.settings.selectedSets(selectedSets);
    saveSettings(this.settings);
  }

  private isPrioritizeSetAllowedChanged() {
    if (!this.isPrioritizeSetAllowed()) {
      this.randomizerSettings.prioritizeSet(null);
    }
  }

  private isPrioritizeSetEnabledChanged() {
    if (!this.isPrioritizeSetEnabled()) {
      this.randomizerSettings.prioritizeSet(null);
    }
  }

  private getCardsToExclude() {
    // Only exclude cards when at least 3 sets are selected and no sets are prioritized.
    if (this.randomizerSettings.prioritizeSet()) {
      return [];
    } 
    const setIds = this.getSelectedSetIds();
    return setIds.length < 3 ? [] : this.extractCardIds(this.supplyCards());
  }

  private getExcludeTypes(): CardType[] {
    return this.randomizerSettings.allowAttacks() ? [] : [CardType.ATTACK];
  }

  private extractCardIds(cards: CardViewModel[]) {
    return cards.map((card) => card.id()!);
  }

  private getSelectedSetIds() {
    return this.getSelectedSets().map((set) => set.setId);
  }

  private getSelectedSets() {
    return this.sets().filter((set) => set.isActive());
  }

  private getSelectedCards() {
    return this.supplyCards().filter((card) => card.isSelected());
  }

  private getUnselectedCards() {
    return this.supplyCards().filter((card) => !card.isSelected());
  }

  private getSelectedEvents() {
    return this.getSelectedAddons(Event);
  }

  private getSelectedLandmarks() {
    return this.getSelectedAddons(Landmark);
  }

  private getSelectedProjects() {
    return this.getSelectedAddons(Project);
  }

  private getSelectedAddons<T>(constructorFn: new (...args: any[]) => T) {
    const selectedAddons: CardViewModel[] = [];
    for (let addon of this.addons()) {
      if (!addon.id() || !addon.isSelected()) {
        continue;
      }
      const card = DominionSets.getCardById(addon.id()!);
      if (card instanceof constructorFn) {
        selectedAddons.push(addon);
      }
    }
    return selectedAddons;
  }

  private getSelectedUndefinedAddons() {
    const selectedAddons = [];
    for (const addon of this.addons()) {
      if (addon.isLoading() && addon.isSelected()) {
        selectedAddons.push(addon);
      }
    }
    return selectedAddons;
  }

  private updateUrlForKingdom(kingdom: Kingdom) {
    const url = new URL(location.href);
    url.search = serializeKingdom(kingdom);
    history.replaceState({}, "", url.href);
  }

  private loadCardBacks() {
    const start = Date.now();
    let remaining = 2;
    const handleLoaded = () => {
      if (--remaining <= 0) {
        return;
      }
      const timeRemaining = 500 - (Date.now() - start);
      if ((timeRemaining) > 0) {
        setTimeout(() => this.hasLoaded(true), timeRemaining);
      } else {
        this.hasLoaded(true);
      }
    };
    $.imgpreload(CardViewModel.VERTICAL_LOADING_IMAGE_URL, handleLoaded);
    $.imgpreload(CardViewModel.HORIZONTAL_LOADING_IMAGE_URL, handleLoaded);
  }

  private sortCards() {
    const isEnlarged = this.isEnlarged() && this.isCondensed();
    const $body = $("body");
    const cards = this.supplyCards();
    const $cards = $("#cards").find(".card-wrap .card-front");
    const descriptors: CardMoveDescriptor[] = [];
    for (let i = 0; i < cards.length; i++) {
      descriptors.push({card: cards[i], element: $($cards[i])});
    }
    descriptors.sort((a, b) => this.descriptorSorter(a, b));
    
    const movedDescriptors: CardMoveDescriptor[] = [];
    for (let i = 0; i < descriptors.length; i++) {
      const descriptor = descriptors[i];
      for (let j = 0; j < cards.length; j++) {
        const card = cards[j];
        if (card == descriptor.card && i != j) {
          descriptor.moveFrom = descriptor.element.offset();
          descriptor.moveTo = $($cards[i]).offset();
          movedDescriptors.push(descriptor);
        }
      }
    }

    for (let i = 0; i < movedDescriptors.length; i++) {
      const descriptor = movedDescriptors[i];
      const clone = descriptor.element.clone(false);
      
      const tX = descriptor.moveTo!.left - descriptor.moveFrom!.left;
      const tY = descriptor.moveTo!.top - descriptor.moveFrom!.top;
      
      // Set up everything for the animation.
      if (isEnlarged) {
        clone.addClass("enlarge-cards");
      }
      
      const css: any = {
        position: "absolute",
        height: descriptor.element.height(),
        width: descriptor.element.width(),
        top: descriptor.moveFrom!.top,
        left: descriptor.moveFrom!.left,
        "transition-property":
            "-webkit-transform, -webkit-filter, -moz-transform, -moz-filter, opacity",
      };
      IndexPage.addVenderPrefixes(css, "transition-timing-function", "ease-in-out");
      IndexPage.addVenderPrefixes(css, "transition-duration", "600ms");
      IndexPage.addVenderPrefixes(css, "transition-delay", 0);
      IndexPage.addVenderPrefixes(css, "filter", "none");
      IndexPage.addVenderPrefixes(css, "transition", "transform 600ms ease-in-out");
      IndexPage.addVenderPrefixes(css, "transform", "translate(0px,0px)");
      clone.appendTo($body);
      clone.css(css);
      const $elements =
          $([descriptor.element.get(0), descriptor.element.siblings(".card-back").get(0)]);
      $elements.css("visibility", "hidden");

      const cleanUp = () => {
        $elements.css("visibility", "visible");
        clone.remove();
      };
      clone.bind("webkitTransitionEnd transitionend otransitionend oTransitionEnd", cleanUp);
      
      // Schedule an additional clean-up in case the browser fails to send transition ended events.
      setTimeout(cleanUp, 610);
      
      // This timeout is required so that the animation actually takes place.
      setTimeout(() => {
        clone.css("transform", `translate(${tX}px,${tY}px)`);
      }, 0);
    }

    // Sort all the cards while the ones that will change position are moving.
    this.supplyCards.sort((a, b) => this.cardSorter(a, b));
  }

  private descriptorSorter(a: CardMoveDescriptor, b: CardMoveDescriptor) {
    return this.cardSorter(a.card, b.card);
  }

  private cardSorter(a: CardViewModel, b: CardViewModel) {
    return this.supplyCardSorter(
        DominionSets.getSupplyCardById(a.id()!), DominionSets.getSupplyCardById(b.id()!));
  }

  private supplyCardSorter(a: SupplyCard, b: SupplyCard) {
    if (this.settings.sortOption() == SortOption.SET && a.setId != b.setId) {
      return a.setId < b.setId ? -1 : 1;
    }
    if (this.settings.sortOption() == SortOption.COST) {
      const costComparison = IndexPage.compareCosts(a, b);
      if (costComparison != 0) {
        return costComparison;
      }
    }
    return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
  }

  private static compareCosts(a: SupplyCard, b: SupplyCard) {
    const costA = this.getCostSum(a);
    const costB = this.getCostSum(b);
    return costA == costB ? 0 : costA < costB ? -1 : 1;
  }

  private static getCostSum(supplyCard: SupplyCard) {
    return supplyCard.cost.treasure + supplyCard.cost.potion * 0.9 + supplyCard.cost.debt;
  }

  private static addVenderPrefixes(properties: any, propertyName: string, value: string | number) {
    properties["-webkit-" + propertyName] = value;
    properties["-moz-" + propertyName] = value;
    properties[propertyName] = value;
    return properties;
  }
}
