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
  if (location.hostname.indexOf("localhost") == -1) {
    Cookie.set("options", settings, {
      expires: 365, 
      sameSite: "none", 
      secure: true
    });
  } else {
    Cookie.set("options", settings, {
      expires: 365, 
      sameSite: "strict", 
      secure: false,
    });
  }
}
