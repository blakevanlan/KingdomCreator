import * as ko from "knockout";
import * as $ from "jquery";
import {Page} from "./pages/page";
import {initializeBindingHandlers} from "./binding-handlers/binding-handlers";

const CONDENSED_WIDTH = 800;

export function initialize(page: Page) {
  initializeBindingHandlers();
  $(document).ready(() => {
      ko.applyBindings(page);
      $(window).on("resize", () => updateIsCondensed(page));
      updateIsCondensed(page);
  });
}

function updateIsCondensed(page: Page) {
  page.isCondensed($(window).width()! <= CONDENSED_WIDTH);
}
