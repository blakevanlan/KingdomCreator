"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextLayer = function (_StackViewLayer) {
    _inherits(TextLayer, _StackViewLayer);

    function TextLayer(rootNode, cardStack) {
        _classCallCheck(this, TextLayer);

        var _this = _possibleConstructorReturn(this, (TextLayer.__proto__ || Object.getPrototypeOf(TextLayer)).call(this, rootNode, cardStack));

        _this.node.style.zIndex = 4;
        _this.node.classList.add("text-layer");
        return _this;
    }

    _createClass(TextLayer, [{
        key: "redraw",
        value: function redraw(w, h) {
            var card = this.cardStack.topCard;
            var cardName = card.cardName;
            var cardSize = this.cardStack.cardSize;
            var isInherited = card.cardName === CardNames.ESTATE && card.types.includes(Types.ACTION);
            var shouldHide = cardSize !== CardSizes.FULL || cardName.isBack() || this.cardStack.hasFilter("appears-anonymous") || this.cardStack.hasFilter("inverted-card") || !(cardName in LANGUAGE.getCardText);

            if (shouldHide) {
                this.node.classList.add("invisible");
                return;
            } else {
                this.node.classList.remove("invisible");
            }

            var boldLineFactor = 1.3;
            var bigLineFactor = 2;
            var separatorFactor = cardName.isLandscape() ? 0.4 : 0.8;
            var blankFactor = cardName.isLandscape() ? 0.2 : 0.4;
            var maxFontFactor = 0.15;
            var maxLandscapeFontFactor = 0.4;
            var heirloomFactor = 0.8;
            var victoryURL = 'images/elements/victory_150.png';
            var victoryRatio = 0.9;
            var sunURL = 'images/elements/rsun.png';
            var sunRatio = 1;

            var measurementCanvas = document.createElement("canvas");
            var ctx = measurementCanvas.getContext("2d");
            var measureBlock = function measureBlock(block, fontFamily, measurementSize) {
                switch (block.type) {
                    case "normal":
                        ctx.font = measurementSize + "px " + fontFamily;
                        return ctx.measureText(block.inner).width;
                    case "italics":
                        ctx.font = "italic " + measurementSize + "px " + fontFamily;
                        return ctx.measureText(block.inner).width;
                    case "bold":
                        ctx.font = "bold " + measurementSize + "px " + fontFamily;
                        return ctx.measureText(block.inner).width;
                    case "coin":
                        return measurementSize;
                    case "bigcoin":
                        return measurementSize;
                    case "shield":
                        ctx.font = "bold " + measurementSize + "px " + fontFamily;
                        return ctx.measureText(block.inner).width + measurementSize * victoryRatio;
                    case "bigshield":
                        ctx.font = "bold " + measurementSize * bigLineFactor + "px " + fontFamily;
                        return ctx.measureText(block.inner).width + measurementSize * victoryRatio;
                    case "sun":
                        return measurementSize;
                }
            };

            var measureLine = function measureLine(line, fontFamily, measurementSize) {
                var lineIsBold = line.match(/^\|.*?\|$/);
                var lineIsHeirloom = line.match(/^%%.*?%%$/);
                var lineIsItalics = line.match(/^%.*?%$/);
                var lineIsSeparator = line === "---";
                var lineIsBlank = line === "";
                var lineIsBig = line.match(/^[\[{]!.*?[\]}]$/);
                var lineText = lineIsBold || lineIsItalics ? line.slice(1, line.length - 1) : line;

                if (lineIsBold) measurementSize *= boldLineFactor;
                if (lineIsBig) measurementSize *= bigLineFactor;
                if (lineIsSeparator) measurementSize *= separatorFactor;
                if (lineIsBlank) measurementSize *= blankFactor;
                if (lineIsHeirloom) {
                    lineText = line.slice(2, line.length - 2);
                    measurementSize *= heirloomFactor;
                }

                var totalLength = 0;
                if (!lineIsSeparator && !lineIsBlank) {
                    var blocks = makeBlocks(line);
                    blocks.forEach(function (block) {
                        if (block === "bigcoin") measurementSize *= 1.1;
                        if (block === "shield" || block === "bigshield") totalLength += measureBlock(block, "Minion-Bold", measurementSize);else totalLength += measureBlock(block, fontFamily, measurementSize);
                    });
                }

                return { width: totalLength, height: measurementSize };
            };

            var makeBlocks = function makeBlocks(line) {
                var tests = [{ regex: /^([^<>\[{\|%]+)/, type: "normal" }, { regex: /^\|(.*?)\|/, type: "bold" }, { regex: /^%%(.*?)%%/, type: "italics" }, { regex: /^%(.*?)%/, type: "italics" }, { regex: /^\[!(.*?)\]/, type: "bigcoin" }, { regex: /^\[(.*?)\]/, type: "coin" }, { regex: /^{!(.*?)}/, type: "bigshield" }, { regex: /^{(.*?)}/, type: "shield" }, { regex: /^<>/, type: "sun" }];
                var blocks = [];
                while (line.length > 0) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = tests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var test = _step.value;

                            var match = line.match(test.regex);
                            if (match) {
                                blocks.push({ type: test.type, inner: match[1] });
                                line = line.slice(match[0].length);
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
                return blocks;
            };

            var renderBlock = function renderBlock(fontFamily, boldFontFamily) {
                return function (block) {
                    var node = document.createElement("span");
                    node.classList.add("card-text-block");
                    node.style.fontFamily = fontFamily;

                    var handleTerminalPunctuation = function handleTerminalPunctuation() {
                        var punctuation = "+-,;.";
                        if (punctuation.includes(node.innerHTML[0])) node.classList.add("no-left-margin");
                        if (punctuation.includes(node.innerHTML[node.innerHTML.length - 1])) node.classList.add("no-right-margin");
                    };

                    switch (block.type) {
                        case "normal":
                            node.innerHTML = block.inner;
                            handleTerminalPunctuation();
                            return node;
                        case "italics":
                            node.innerHTML = block.inner;
                            node.style.fontStyle = "italic";
                            handleTerminalPunctuation();
                            return node;
                        case "bold":
                            node.innerHTML = block.inner;
                            node.style.fontFamily = boldFontFamily;
                            node.style.fontWeight = "bold";
                            handleTerminalPunctuation();
                            return node;
                        case "coin":
                        case "bigcoin":
                            var cost = { coin: 0, potion: 0, debt: 0 };
                            var forceShow = null;
                            if (block.inner === "P") cost.potion = 1;
                            if (block.inner.match(/\d+D/)) cost.debt = parseInt(block.inner.match(/(\d+)D/)[1]);else if (block.inner === "D") forceShow = "debt";else if (block.inner === "") forceShow = "coin";else cost.coin = parseInt(block.inner);
                            node.appendChild(createCostNode(cost, forceShow));
                            return node;
                        case "shield":
                        case "bigshield":
                            return createVictoryNode(block.inner);
                        case "sun":
                            var sunNode = document.createElement(block.inner);
                            sunNode.classList.add("sun-icon");
                            return sunNode;
                    }
                };
            };

            var renderLine = function renderLine(fontFamily, boldFontFamily) {
                return function (line) {
                    var node = document.createElement("div");
                    node.classList.add("card-text-line");
                    var lineIsBold = line.match(/^\|.*?\|$/);
                    var lineIsHeirloom = line.match(/^%%.*?%%$/);
                    var lineIsItalics = line.match(/^%.*?%$/);
                    var lineIsSeparator = line === "---";
                    var lineIsBlank = line === "";
                    var lineIsBig = line.match(/^[\[{]!.*?[\]}]$/);
                    var lineText = lineIsBold || lineIsItalics ? line.slice(1, line.length - 1) : line;
                    if (lineIsSeparator) {
                        node.classList.add("separator-line");
                        node.style.height = 0.2 * separatorFactor + "em";
                        node.style.margin = 0.5 * separatorFactor + "em 0 " + 0.3 * separatorFactor + "em 0";
                        node.style.backgroundColor = cardName.textColor();
                        return node;
                    }
                    if (lineIsBlank) {
                        node.style.height = blankFactor + "em";
                        return node;
                    }
                    if (lineIsBold) {
                        node.style.fontWeight = "bold";
                        node.style.fontSize = boldLineFactor + "em";
                        node.style.fontFamily = boldFontFamily;
                        fontFamily = boldFontFamily;
                    }
                    if (lineIsBig) {
                        node.style.fontSize = bigLineFactor + "em";
                    }
                    if (lineIsHeirloom) {
                        lineText = line.slice(2, line.length - 2);
                        node.classList.add("heirloom-line");
                        node.style.fontStyle = "italic";
                        node.style.fontSize = heirloomFactor + "em";
                    }
                    if (lineIsItalics) {
                        node.style.fontStyle = "italic";
                    }

                    var blocks = makeBlocks(lineText);
                    var renderedBlocks = blocks.map(renderBlock(fontFamily, boldFontFamily));
                    renderedBlocks.forEach(function (blockNode) {
                        return node.appendChild(blockNode);
                    });
                    return node;
                };
            };
            var cardTextRaw = isInherited ? LANGUAGE.getPhrase[Phrases.INHERITANCE_INSTRUCTIONS] : LANGUAGE.getCardText[cardName];
            var lines = cardTextRaw.split("//");

            var bodyFont = LANGUAGE.getEnvironment.hasOwnProperty("bodyFont") ? LANGUAGE.getEnvironment.bodyFont : "Times New Roman";
            var boldFont = LANGUAGE.getEnvironment.hasOwnProperty("boldFont") ? LANGUAGE.getEnvironment.boldFont : "Times New Roman";

            var measurementSize = 50;
            var longestWidth = 1;
            var totalHeight = 1;
            lines.forEach(function (line) {
                var metrics = measureLine(line, bodyFont, measurementSize);
                longestWidth = Math.max(longestWidth, metrics.width);
                totalHeight += metrics.height;
            });

            var bbox = getCardTextBbox(w, cardName);
            this.node.style.left = bbox.x + "px";
            this.node.style.top = bbox.y + "px";
            this.node.style.width = bbox.width + "px";
            this.node.style.height = bbox.height + "px";
            this.node.style.color = cardName.textColor();

            var containerNode = document.createElement("div");
            containerNode.classList.add("card-text-container");
            var capSize = bbox.height * (cardName.isLandscape() ? maxLandscapeFontFactor : maxFontFactor);
            var measuredSize = Math.min(measurementSize * bbox.height / totalHeight, measurementSize * bbox.width / longestWidth);
            containerNode.style.fontSize = Math.min(capSize, measuredSize) + "px";

            clearChildNodes(this.node);
            lines.forEach(function (line) {
                containerNode.appendChild(renderLine(bodyFont, boldFont)(line));
            });
            this.node.appendChild(containerNode);
        }
    }]);

    return TextLayer;
}(StackViewLayer);