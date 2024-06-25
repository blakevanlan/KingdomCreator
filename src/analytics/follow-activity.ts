/*
/// <reference path="../../node_modules/@types/google.analytics/index.d.ts" />
 to include 
	https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html
	Triple-slash references instruct the compiler to include additional files in the compilation process.
*/

//import * as Track from "../../node_modules/@types/google.analytics/index.d.ts";

export enum EventType {
  LOAD_FULL_KINGDOM_FROM_URL = "LOAD_FULL_KINGDOM_FROM_URL",
  LOAD_PARTIAL_KINGDOM_FROM_URL = "LOAD_PARTIAL_KINGDOM_FROM_URL",
  RANDOMIZE_EVENTS_AND_LANDMARKS = "RANDOMIZE_EVENTS_AND_LANDMARKS",
  RANDOMIZE_ALLY = "RANDOMIZE_ALLY",
  RANDOMIZE_BOONS = "RANDOMIZE_BOONS",
  RANDOMIZE_KINGDOM = "RANDOMIZE_KINGDOM",
  RANDOMIZE_MULTIPLE = "RANDOMIZE_MULTIPLE",
  RANDOMIZE_SINGLE = "RANDOMIZE_SINGLE",

  RANDOMIZE_FULL_KINGDOM= "RANDOMIZE_FULL_KINGDOM",
  RANDOMIZE ="RANDOMIZE_FULL_KINGDOM",
  UPDATE_KINGDOM = "UPDATE_KINGDOM",
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
		//console.log(`send event: ${category}: ${eventType}`);
		//ga("send", "event", category, eventType);
    } catch (e) {
      //console.log(`Attempted to send event: ${category}: ${eventType}`);
    }
  }
}
