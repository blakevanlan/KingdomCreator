import {Settings} from "./settings"
import * as Cookie from "js-cookie";

export function loadSettings(): Settings {
  try {
    const options = Cookie.getJSON("options") || {};
    return Settings.createFromObject(options);
  } catch (e) {
    console.error("Failed to load settings: ", e);
    return Settings.createFromObject({});
  }
}

export function saveSettings(settings: Settings) {
  Cookie.set("options", settings, {expires: 365});
}
