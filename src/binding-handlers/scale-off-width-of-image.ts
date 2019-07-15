import * as ko from "knockout";
import * as $ from "jquery";

interface ScaleOffWithOfImageOptions {
  selector: string;
  trigger?: any;
}

export function bindScaleOffWidthOfImage() {
  ko.bindingHandlers.scaleOffWidthOfImage = {
    init: function(
        element: Node,
        valueAccessor: () => ScaleOffWithOfImageOptions,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const options = ko.unwrap(valueAccessor());
      const selector = ko.unwrap(options.selector);
      const $element = $(element);
      const $image = $element.find(selector).eq(0);
      const image = $image.get(0) as HTMLImageElement;
      ko.utils.domData.set(element, "image", image);

      const boundUpdateHeightBasedOnWidth = () => {
        updateHeightBasedOnWidth($element, image);
      };
      $(window).on("resize", boundUpdateHeightBasedOnWidth);
      $image.on("load", boundUpdateHeightBasedOnWidth);
      boundUpdateHeightBasedOnWidth();
    },
    update: function(
        element: Node,
        valueAccessor: () => ScaleOffWithOfImageOptions,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      ko.unwrap(ko.unwrap(valueAccessor()).trigger);
      const $element = $(element);
      const image = ko.utils.domData.get(element, "image") as HTMLImageElement;

      // Retry to catch when the dom doesn't update before this is called.
      if (!updateHeightBasedOnWidth($element, image)) {
        setTimeout(() => { updateHeightBasedOnWidth($element, image) }, 0) ;
      }
    }
  };
}

function updateHeightBasedOnWidth($element: JQuery<Node>, image: HTMLImageElement) {
  const oldHeight = $element.height()!;
  const ratio = image.naturalHeight / image.naturalWidth;
  if (ratio) {
    $element.height($element.width()! * ratio); 
  }
  const newHeight = $element.height()!;
  return oldHeight != newHeight && newHeight != 0;
}