"use strict";

try {
    webclient.filter('trustAsHtml', ['$sce', function ($sce) {
        return function (html) {
            return $sce.trustAsHtml(html);
        };
    }]);
} catch (Exception) {
    console.log("no webclient");
}

function computeX(left, right, width, margin, index, count) {
    var centered = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;

    var excess = right - left - width * count;
    var excessPer = count > 1 ? Math.min(margin, excess / (count - 1)) : 0;
    var containerWidth = (width + excessPer) * count - excessPer;

    var leftLimit = void 0;
    if (centered) leftLimit = (right + left - containerWidth) / 2;else leftLimit = left;

    return leftLimit + (width + excessPer) * index;
}

var getCardArtBbox = function getCardArtBbox(w, cardName, cardSize) {
    if (cardName.isLandscape()) {
        var _h = w * cardSize.landscapeRatio;
        return new Rectangle(0.04 * w, 0.13 * _h, 0.92 * w, 0.60 * _h);
    }
    var h = w * cardSize.ratio;
    if (cardSize === CardSizes.MINI) {
        return new Rectangle(0.055 * w, 0.18 * h, 0.9 * w, 0.70 * h);
    }
    if (cardName.isBaseCard()) {
        return new Rectangle(0.059 * w, 0.14 * h, 0.87 * w, 0.74 * h);
    }
    return new Rectangle(0.059 * w, 0.11 * h, 0.88 * w, 0.41 * h);
};

var getCardNameBbox = function getCardNameBbox(w, cardName, cardSize) {
    var isShifted = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var h = void 0;
    if (cardName.isLandscape()) {
        h = w * cardSize.landscapeRatio;
    } else {
        h = w * cardSize.ratio;
    }
    var baseX = isShifted ? 0.24 * w : 0.09 * w;
    var baseWidth = isShifted ? 0.68 * w : 0.82 * w;
    switch (cardSize) {
        case CardSizes.FULL:
            if (cardName === CardNames.CURSE) return new Rectangle(baseX, 0.061 * h, baseWidth, 0.097 * h);else if (cardName.isBasicTreasure()) return new Rectangle(0.21 * w, 0.06 * h, 0.58 * w, 0.097 * h);else if (cardName.isBaseCard()) return new Rectangle(baseX, 0.057 * h, baseWidth, 0.097 * h);else if (cardName.isTreasure() && !cardName.isVictory() && !cardName.isAction()) return new Rectangle(0.21 * w, 0.045 * h, 0.58 * w, 0.087 * h);else if (cardName.isLandscape()) return new Rectangle(0.32 * w, 0.05 * h, 0.39 * w, 0.068 * h);else return new Rectangle(baseX, 0.049 * h, baseWidth, 0.082 * h);
        case CardSizes.MINI:
            if (cardName.isLandscape()) return new Rectangle(baseX, 0.72 * h, baseWidth, 0.24 * h);else return new Rectangle(baseX, 0.06 * h, baseWidth, 0.145 * h);
        case CardSizes.MICRO:
            if (cardName.isLandscape()) return new Rectangle(baseX, 0.18 * h, baseWidth, 0.775 * h);else return new Rectangle(baseX, 0.23 * h, baseWidth, 0.775 * h);
    }
};

var getCardTypeBbox = function getCardTypeBbox(w, cardName) {
    var h = w * CardSizes.FULL.ratio;
    if (cardName.isBasicTreasure()) return new Rectangle(0.23 * w, 0.85 * h, 0.65 * w, 0.097 * h);else if (cardName.isBaseCard()) return new Rectangle(0.23 * w, 0.86 * h, 0.65 * w, 0.097 * h);else return new Rectangle(0.23 * w, 0.88 * h, 0.65 * w, 0.068 * h);
};

var getCardMarkerBbox = function getCardMarkerBbox(w, cardName) {
    var h = w * CardSizes.MINI.ratio;
    return new Rectangle(0.17 * w, 0.85 * h, 0.72 * w, 0.145 * h);
};

var getCardTextBbox = function getCardTextBbox(w, cardName) {
    if (cardName.isLandscape()) {
        var h = w * CardSizes.FULL.landscapeRatio;
        return new Rectangle(0.09 * w, 0.72 * h, 0.815 * w, 0.21 * h);
    } else if (cardName.hasHeirloom()) {
        var _h2 = w * CardSizes.FULL.ratio;
        return new Rectangle(0.1 * w, 0.55 * _h2, 0.795 * w, 0.27 * _h2);
    } else {
        var _h3 = w * CardSizes.FULL.ratio;
        return new Rectangle(0.1 * w, 0.55 * _h3, 0.795 * w, 0.31 * _h3);
    }
};

var getExpansionIconBbox = function getExpansionIconBbox(w, cardName) {
    if (cardName.isLandscape()) {
        var h = w * CardSizes.FULL.landscapeRatio;
        return new Rectangle(0.925 * w, 0.72 * h, 0.03 * w, 0.03 * w);
    } else {
        var _h4 = w * CardSizes.FULL.ratio;
        return new Rectangle(0.9 * w, 0.89 * _h4, 0.039 * _h4, 0.039 * _h4);
    }
};

var getCostPosition = function getCostPosition(w, cardName, cardSize) {
    var h = w * CardSizes.FULL.ratio;
    if (cardName.isLandscape()) {
        h = w * CardSizes.FULL.landscapeRatio;
        if (cardSize === CardSizes.FULL) return new Rectangle(0.01 * w, 0.02 * h, 0.145 * h, 0.145 * h);else if (cardSize === CardSizes.MINI) return new Rectangle(0.01 * w, 0.02 * h, 0.2 * h, 0.2 * h);
    } else if (cardSize === CardSizes.FULL) {
        if (cardName.isBasicTreasure()) return new Rectangle(0.039 * w, 0.84 * h, 0.1 * h, 0.1 * h);else return new Rectangle(0.039 * w, 0.86 * h, 0.1 * h, 0.1 * h);
    } else if (cardSize === CardSizes.MINI) {
        h = w * CardSizes.MINI.ratio;
        return new Rectangle(0.015 * w, 0.79 * h, 0.2 * h, 0.2 * h);
    }
};

var drawFilledImage = function drawFilledImage(ctx, source, x, y, w, h) {
    var centered = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;

    var sourceWidth = Math.min(source.width, source.height * w / h);
    var sourceHeight = Math.min(source.height, source.width * h / w);
    var sourceX = centered ? (source.width - sourceWidth) / 2 : 0;
    var sourceY = centered ? (source.height - sourceHeight) / 2 : 0;
    ctx.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, x, y, w, h);
};

var measureFittedText = function measureFittedText(ctx, text, bbox, verticalFactor, fontFamily) {
    var fontWeight = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";

    var measurementSize = 50;
    ctx.font = fontWeight + ' ' + measurementSize + 'px ' + fontFamily;
    var metrics = ctx.measureText(text);
    var widthFactor = bbox.width / metrics.width;
    return Math.min(bbox.height * verticalFactor, measurementSize * widthFactor);
};

var drawFittedText = function drawFittedText(ctx, text, bbox, verticalFactor, fontFamily) {
    var fontWeight = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
    var shouldStroke = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    var centered = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : true;

    var fontSize = measureFittedText(ctx, text, bbox, verticalFactor, fontFamily, fontWeight);
    ctx.font = fontWeight + ' ' + Math.ceil(fontSize) + 'px ' + fontFamily;
    ctx.textAlign = centered ? "center" : "left";
    ctx.textBaseline = "middle";
    if (shouldStroke) {
        ctx.lineWidth = Math.ceil(fontSize / 10);
        ctx.strokeText(text, bbox.x + (centered ? bbox.width / 2 : 0), bbox.y + bbox.height / 2);
    }
    ctx.fillText(text, Math.round(bbox.x + (centered ? bbox.width / 2 : 0)), Math.round(bbox.y + bbox.height / 2));
};

var fitTextInNode = function fitTextInNode(text, node, bbox) {
    var shouldDuplicate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    clearChildNodes(node);

    var innerNode = document.createElement("div");
    innerNode.classList.add("text-fitter-node");
    node.appendChild(innerNode);
    innerNode.innerHTML = text;
    var measurementCanvas = document.createElement("canvas");
    var ctx = measurementCanvas.getContext("2d");

    var measurementSize = 50;
    ctx.font = measurementSize + 'px ' + node.style.fontFamily;
    var measuredWidth = ctx.measureText(text).width;
    var measuredSize = Math.min(bbox.height, measurementSize * bbox.width / measuredWidth);
    innerNode.style.fontSize = 'min(1em, ' + measuredSize + 'px)';

    // Man chrome why don't you support paint-order
    if (shouldDuplicate) {
        var duplicateNode = document.createElement("div");
        duplicateNode.classList.add("text-fitter-duplicate");
        node.appendChild(duplicateNode);
        duplicateNode.innerHTML = text;
        duplicateNode.style.fontSize = 'min(1em, ' + measuredSize + 'px)';
    }
};

var costURLs = ["images/elements/coin.png", "images/elements/potion.png", "images/elements/debt_130.png"];
var drawCostAmount = function drawCostAmount(ctx, costAmount, position) {
    var forceShow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    var sources = costURLs.map(function (src) {
        return Preloader.loadedSources[src];
    });
    var drawIndex = 0;
    var offsetAmount = position.height * 0.75;
    var oldFill = ctx.fillStyle;
    if (costAmount.coin > 0 || costAmount.potion === 0 && costAmount.debt === 0 && forceShow !== "debt") {
        ctx.drawImage(sources[0], position.x + offsetAmount * drawIndex, position.y, position.height, position.height);
        var amountText = costAmount.coin;
        ctx.fillStyle = "black";
        if (forceShow !== "coin" || costAmount.coin > 0) {
            drawFittedText(ctx, amountText, new Rectangle(position.x + position.height * 0.1 + offsetAmount * drawIndex, position.y + 0.05 * position.height, position.height * 0.8, position.height), 0.9, "Minion-Bold");
        }
        drawIndex++;
    }
    if (costAmount.potion > 0) {
        ctx.drawImage(sources[1], position.x + offsetAmount * drawIndex, position.y, position.height * 0.65, position.height);
        if (costAmount.potion > 1) {
            var _amountText = costAmount.potion;
            ctx.fillStyle = "white";
            drawFittedText(ctx, _amountText, new Rectangle(position.x + offsetAmount * drawIndex, position.y + position.height * 0.4, position.height * 0.6, position.height * 0.6), 0.9, "Minion-Bold");
        }
        drawIndex += 0.65;
    }

    if (costAmount.debt > 0 || forceShow === "debt") {
        ctx.drawImage(sources[2], position.x + offsetAmount * drawIndex, position.y + position.height * 0.025, position.height, position.height * 0.95);
        var _amountText2 = costAmount.debt;
        ctx.fillStyle = "white";
        if (forceShow !== "debt" || costAmount.debt > 0) {
            drawFittedText(ctx, _amountText2, new Rectangle(position.x + offsetAmount * drawIndex, position.y + 0.05 * position.height, position.height, position.height), 0.9, "Minion-Bold");
        }
        drawIndex++;
    }

    ctx.fillStyle = oldFill;
};

var createCostNode = function createCostNode(costAmount) {
    var forceShow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var node = document.createElement("span");
    node.classList.add("cost-container");
    if (costAmount.coin > 0 || costAmount.potion === 0 && costAmount.debt === 0 && forceShow !== "debt") {
        var subNode = document.createElement("div");
        subNode.classList.add("coin-cost");
        node.appendChild(subNode);
        var amountText = costAmount.coin;
        if (forceShow !== "coin" || costAmount.coin > 0) {
            subNode.innerHTML = amountText;
        }
    }
    if (costAmount.potion > 0) {
        var _subNode = document.createElement("div");
        _subNode.classList.add("potion-cost");
        node.appendChild(_subNode);
        if (costAmount.potion > 1) {
            var _amountText3 = costAmount.potion;
            var potionTextCointainer = document.createElement("span");
            potionTextCointainer.classList.add("potion-cost-text");
            potionTextCointainer.appendChild(potionTextCointainer);
            potionTextCointainer.innerHTML = _amountText3;
        }
    }

    if (costAmount.debt > 0 || forceShow === "debt") {
        var _subNode2 = document.createElement("div");
        _subNode2.classList.add("debt-cost");
        node.appendChild(_subNode2);
        var _amountText4 = costAmount.debt;
        if (forceShow !== "debt" || costAmount.debt > 0) {
            _subNode2.innerHTML = _amountText4;
        }
    }

    return node;
};

var createVictoryNode = function createVictoryNode(amount) {
    var node = document.createElement("span");
    node.classList.add("victory-container");
    var amountNode = document.createElement("div");
    amountNode.classList.add("victory-amount");
    amountNode.innerHTML = amount;
    node.appendChild(amountNode);
    var iconNode = document.createElement("div");
    iconNode.classList.add("victory-shield");
    node.appendChild(iconNode);
    return node;
};

var rgbToHex = function rgbToHex(red, green, blue) {
    var toHex = function toHex(x) {
        var raw = Math.floor(x);
        if (raw < 16) return '0' + raw.toString(16);
        return raw.toString(16);
    };
    return '#' + toHex(red) + toHex(green) + toHex(blue);
};

var clearChildNodes = function clearChildNodes(node) {
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
};

var assignPositionToNode = function assignPositionToNode(position, node) {
    node.style.left = position.x + 'px';
    node.style.top = position.y + 'px';
    node.style.width = position.width + 'px';
    node.style.height = position.height + 'px';
};