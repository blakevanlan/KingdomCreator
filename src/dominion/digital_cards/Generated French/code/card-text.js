"use strict";

webclient.component("cardTextBlock", {
  bindings: {
    type: "<",
    inner: "<",
  },
  controller: function controller() {
    var self = this;

    self.html = "";

    self.plainText = "";
    self.isCost = function () {
      return self.type === "coin" || self.type === "bigcoin";
    };
    self.isVP = function () {
      return self.type === "shield" || self.type === "bigshield";
    };
    self.vpAmount = 0;
    self.cost = { coin: 0, potion: 0, debt: 0 };
    self.forceShow = "";
    if (self.isCost()) {
      if (self.inner === "P") self.cost.potion = 1;
      if (self.inner.match(/\d+D/))
        self.cost.debt = parseInt(self.inner.match(/(\d+)D/)[1]);
      else if (self.inner === "D") self.forceShow = "debt";
      else if (self.inner === "") self.forceShow = "coin";
      else self.cost.coin = parseInt(self.inner);
    } else if (self.isVP()) {
      if (self.inner === "") self.forceShow = true;
      else self.vpAmount = parseInt(self.inner);
    } else {
      self.plainText = self.inner;
    }
  },
  preserveWhitespaces: false,
  template:
    '<span ng-if="$ctrl.plainText.length > 0">{{$ctrl.plainText}}</span>\n<div\n    class="cost-container-wrapper"\n    ng-if="$ctrl.isCost()"><cost-container\n        coin="$ctrl.cost.coin"\n        potion="$ctrl.cost.potion"\n        debt="$ctrl.cost.debt"\n        force-show="$ctrl.forceShow"></cost-container></div>\n<div class="vp-container-wrapper" ng-if="$ctrl.isVP()"><vp-container amount="$ctrl.vpAmount" force-show="$ctrl.forceShow"></vp-container></div>',
});

webclient.component("cardTextLine", {
  bindings: {
    text: "<",
  },
  controller: function controller() {
    var self = this;

    var text = self.text;
    self.blocks = [];
    self.isSeparator = self.text === "---";
    self.isBlank = self.text === "";

    var tests = [
      { regex: /^([^\[{\|%]+)/, type: "normal" },
      { regex: /^\|(.*?)\|/, type: "bold" },
      { regex: /^%(.*?)%/, type: "italics" },
      { regex: /^\[!(.*?)\]/, type: "bigcoin" },
      { regex: /^\[(.*?)\]/, type: "coin" },
      { regex: /^{!(.*?)}/, type: "bigshield" },
      { regex: /^{(.*?)}/, type: "shield" },
    ];

    if (!self.isSeparator && !self.isBlank) {
      while (text.length > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (
            var _iterator = tests[Symbol.iterator](), _step;
            !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
            _iteratorNormalCompletion = true
          ) {
            var test = _step.value;

            var match = text.match(test.regex);
            if (match) {
              self.blocks.push({ type: test.type, inner: match[1] });
              text = text.slice(match[0].length);
              break;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }

    self.blockClasses = {
      normal: "card-text-block",
      bold: "card-text-block bold",
      italics: "card-text-block italics",
      bigcoin: "card-text-block cost-large",
      coin: "card-text-block cost",
      bigshield: "card-text-block shield-large",
      shield: "card-text-block shield",
    };
  },
  template:
    '\n        <card-text-block\n            ng-repeat="b in $ctrl.blocks"\n            type="b.type"\n            ng-class="$ctrl.blockClasses[b.type]"\n            inner="b.inner"\n        ></card-text-block>\n    ',
});

webclient.component("cardText", {
  bindings: {
    cardText: "<",
    isLandscape: "<",
  },
  controller: [
    "$scope",
    function ($scope) {
      var self = this;

      var updateLines = function updateLines() {
        self.lines = self.cardText.split("//");
      };
      $scope.$watch("$ctrl.cardText", updateLines);

      var getFontStyle = function getFontStyle() {
        return LANGUAGE.getEnvironment.determineFontStyle(
          self.isLandscape,
          self.lines
        );
      };

      var lineIsBold = function lineIsBold(line) {
        return line.match(/^\|.*?\|$/) ? " bold-line" : "";
      };
      var lineIsItalics = function lineIsItalics(line) {
        return line.match(/^%.*?%$/) ? " italics-line" : "";
      };
      var lineIsSeparator = function lineIsSeparator(line) {
        return line === "---" ? " separator-line" : "";
      };
      var lineIsBlank = function lineIsBlank(line) {
        return line === "" ? " blank-line" : "";
      };
      var lineIsBig = function lineIsBig(line) {
        return line.match(/^[\[{]!.*?[\]}]$/) ? " huge-line" : "";
      };

      self.getLineClass = function (line) {
        return (
          getFontStyle() +
          lineIsBold(line) +
          lineIsItalics(line) +
          lineIsSeparator(line) +
          lineIsBlank(line) +
          lineIsBig(line)
        );
      };
      self.getLineText = function (line) {
        return lineIsBold(line) || lineIsItalics(line)
          ? line.slice(1, line.length - 1)
          : line;
      };

      self.trackBy = function (l, i) {
        return "" + i + l;
      };
    },
  ],
  template:
    '\n        <card-text-line\n            ng-repeat="l in $ctrl.lines track by $ctrl.trackBy(l, $index)"\n            text="$ctrl.getLineText(l)"\n            ng-class="$ctrl.getLineClass(l)"\n            ng-click="$ctrl.onClick()">\n        </card-text-line>\n    ',
});
