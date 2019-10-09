/// <reference path="../../node_modules/@types/google.analytics/index.d.ts" />

export enum EventType {
  LOAD_FULL_KINGDOM_FROM_URL = "LOAD_FULL_KINGDOM_FROM_URL",
  LOAD_PARTIAL_KINGDOM_FROM_URL = "LOAD_PARTIAL_KINGDOM_FROM_URL",
  RANDOMIZE_EVENTS_AND_LANDMARKS = "RANDOMIZE_EVENTS_AND_LANDMARKS",
  RANDOMIZE_BOONS = "RANDOMIZE_BOONS",
  RANDOMIZE_BANE = "RANDOMIZE_BANE",
  RANDOMIZE_KINGDOM = "RANDOMIZE_KINGDOM",
  RANDOMIZE_MULTIPLE = "RANDOMIZE_MULTIPLE",
  RANDOMIZE_SINGLE = "RANDOMIZE_SINGLE",
}

export enum Category {
  ERROR = "error",
  EVENT = "event",
}

export class EventTracker {
  
  static trackEvent(eventType: EventType) {
    EventTracker.attemptToSend(Category.EVENT, eventType);
  }

  static trackError(errorType: EventType) {
    EventTracker.attemptToSend(Category.ERROR, errorType);
  }

  private static attemptToSend(category: Category, eventType: EventType) {
    try {
      ga("send", "event", category, eventType);
    } catch (e) {
      console.log(`Attempted to send event: ${category}: ${eventType}`);
    }
  }
}
