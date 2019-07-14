/// <reference path="../../typings/jquery.cookie.d.ts" />
import {Settings} from "./settings"

$.cookie.json = true;

export function loadSettings(): Settings {
  try {
    const options = $.cookie("options") || {};
    const optionsAsObject = typeof options == "string" ? JSON.parse(options) : options;
    return Settings.createFromObject(optionsAsObject);
  } catch (e) {
    console.error("Failed to load settings: ", e);
    return Settings.createFromObject({});
  }
}

export function saveSettings(settings: Settings) {
  $.cookie("options", settings.toObject(), {expires: 365});
}
