import {Settings} from "./settings"
import Cookies from "js-cookie";

export function loadSettings(): Settings {
  try {
    const readOptions = Cookies.get("options");
    let options
    if (typeof readOptions === "string" || typeof readOptions ==="undefined" ) {
      options = {};
    } else {
      options = JSON.parse(readOptions);
    }
    return Settings.createFromObject(options);
  } catch (e) {
    console.error("Failed to load settings: ", e);
    return Settings.createFromObject({});
  }
}

export function saveSettings(settings: Settings) {
  if (location.hostname.indexOf("localhost") == -1) {
    Cookies.set("options", 
    JSON.stringify(settings), {
      expires: 365, 
      sameSite: "none",
      secure: true
    });
  } else {
  Cookies.set("options", 
    JSON.stringify(settings), {
      expires: 365, 
      sameSite: "strict",
      secure: false
    });
  }
}
