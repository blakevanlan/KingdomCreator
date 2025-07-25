/*
/// <reference path="../../node_modules/@types/google.analytics/index.d.ts" />
 to include 
	https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html
	Triple-slash references instruct the compiler to include additional files in the compilation process.
*/

//import * as Track from "../../node_modules/@types/google.analytics/index.d.ts";
import { Kingdom } from "../randomizer/kingdom"
import  { serializeKingdom } from "../randomizer/serializer"

export enum EventType {
  LOAD_FULL_KINGDOM_FROM_URL = "LOAD_FULL_KINGDOM_FROM_URL",
  LOAD_PARTIAL_KINGDOM_FROM_URL = "LOAD_PARTIAL_KINGDOM_FROM_URL",
  RANDOMIZE_EVENTS_AND_LANDMARKS = "RANDOMIZE_EVENTS_AND_LANDMARKS",
  RANDOMIZE_ALLY = "RANDOMIZE_ALLY",
  RANDOMIZE_PROPHECY = "RANDOMIZE_PROPHECY",
  RANDOMIZE_BOONS = "RANDOMIZE_BOONS",
  RANDOMIZE_KINGDOM = "RANDOMIZE_KINGDOM",
  RANDOMIZE_MULTIPLE_SUPPLY = "RANDOMIZE_MULTIPLE_SUPPLY",
  RANDOMIZE_SINGLE = "RANDOMIZE_SINGLE",

  RANDOMIZE_FULL_KINGDOM= "RANDOMIZE_FULL_KINGDOM",
  RANDOMIZE ="RANDOMIZE",
  UPDATE_KINGDOM = "UPDATE_KINGDOM",
}

export enum Category {
  ERROR = "error",
  EVENT = "event",
}

export class EventTracker {
  
  static trackEvent(eventType: EventType, kingdom?: Kingdom) {
    // Inclure les données de royaume pour l'événement UPDATE_KINGDOM
    if (eventType === EventType.UPDATE_KINGDOM && kingdom) {
      const kingdomData = serializeKingdom(kingdom);
      EventTracker.attemptToSend(Category.EVENT, eventType, kingdomData);
    } else {
      EventTracker.attemptToSend(Category.EVENT, eventType);
    }
  }

  static trackError(errorType: EventType, additionalData: Record<string, unknown> = {}) {
    EventTracker.attemptToSend(Category.ERROR, errorType, additionalData);
  }

  private static attemptToSend(category: Category, eventType: EventType, additionalData: Record<string, unknown> = {}) {
    try {
	  //console.log(`${category}: ${eventType}`, additionalData);
    //EventTracker.walkstep(category, eventType, additionalData);
    } catch (e) {
      console.log(`ERROR in attempting to send event: ${category}: ${eventType}`);
    }
  }

  /**
 * Fonction walkstep : Envoie des données de traçage au serveur
 * @param {string} type - Event ou erreur
 * @param {Object} query - Paramètres associés sous forme d'objet
 * @param {Record<string, unknown>} additionalData - Données supplémentaires associées
 */
  private static walkstep(type : Category, query : EventType, additionalData: Record<string, unknown> = {}) {
    const sourceValue= window.location.hostname;
    const endpoint = `https://suivi.71yeti.fr/server.php?source=${sourceValue}`
  
    if (!endpoint) {
      console.error('Erreur : l\'adresse d\'enregistrement est obligatoire.');
      return;
    }
    let data
    // Construction des données
    data = {
      eventOrError: type,
      eventType: query, // Type d'événement
      params: { ...additionalData },  // données supplémentaires
    };

    // Envoi de la requête
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }
}
