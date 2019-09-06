const {TextIcon} = require("./text-icon");

const Text = Phaser.Text;

Phaser.Text = function (game, x, y, text, style) {
  this._maxWidth = 0;
  this._maxHeight = 0;
  this._icons = {};
  this._maxFontSize = 0;

  Text.call(this, game, x, y, text, style);

  this._maxFontSize = parseInt(this.fontSize, 10);
};

Object.assign(Phaser.Text, Text);
Phaser.Text.prototype = Object.create(Text.prototype);

Object.defineProperty(Phaser.Text.prototype, "maxWidth", {
  set(v) {
    this._maxWidth = v;
    this.style.wordWrapWidth = v;
    this.dirty = true;
  },
  get() {
    return this._maxWidth;
  },
});

Object.defineProperty(Phaser.Text.prototype, "maxHeight", {
  set(v) {
    this._maxHeight = v;
    this.dirty = true;
  },
  get() {
    return this._maxHeight;
  },
});

Object.defineProperty(Phaser.Text.prototype, "wordWrapWidth", {
  set(v) {
    this.maxWidth = v;
  },
  get() {
    return this.maxWidth;
  },
});

Object.defineProperty(Phaser.Text.prototype, "maxFontSize", {
  set(value) {
    this._maxFontSize = value;
    this.dirty = true;
  },
  get() {
    return this._maxFontSize;
  },
});

Object.defineProperty(Phaser.Text.prototype, "icons", {
  set(value) {
    this._icons = value;
    this.dirty = true;
  },
  get() {
    return this._icons;
  },
});

const originalUpdateText = Phaser.Text.prototype.updateText;

/**
 * This override adds maxWidth, maxHeight, maxFontSize, icons support
 * However removes support of tabs and multi style
 *
 * You can skip override by setting text.style.tabs to none zero values
 * */
Phaser.Text.prototype.updateText = function (adjusted) {
  if (
    this.style.tabs !== 0 ||
    this.colors.length > 0 ||
    this.strokeColors.length > 0 ||
    this.fontWeights.length > 0 ||
    this.fontStyles.length > 0
  ) {
    return originalUpdateText.call(this);
  }

  const fit = this._maxWidth !== 0 && this._maxHeight !== 0 && this._maxFontSize !== 0;

  if (!adjusted && fit) {
    this.fontSize = this._maxFontSize;
  }

  this.texture.baseTexture.resolution = this._res;
  this.context.font = this.style.font;

  let outputText = this.text;

  if (this.characterLimitSize > -1 && this.characterLimitSize < outputText.length) {
    outputText = this.text.substring(0, this.characterLimitSize) + this.characterLimitSuffix;
  }

  const lineWidths = [];
  const fontProperties = this.determineFontProperties(this.style.font);
  const lineHeight = fontProperties.fontSize + this.style.strokeThickness + this.padding.y;
  const iconKeys = Object.keys(this._icons);
  const divider = "cf83e1357eefb8bd";
  const icons = [];
  let maxLineWidth = 0;

  const replacer = (match, key) => {
    if (iconKeys.includes(key) && this._icons[key].image) {
      icons.push(key);
      return divider;
    }

    return match;
  };

  outputText = outputText.replace(/@(.+?)@/g, replacer);
  const textsWithIcons = outputText.split(divider);

  for (let i = 0, l = icons.length; i < l; i++) {
    textsWithIcons.splice(i * 2 + 1, 0, this._icons[icons[i]]);
  }

  let lines = [[]];
  let words;

  for (let i = 0, l = textsWithIcons.length; i < l; i++) {
    const item = textsWithIcons[i];
    words = lines[lines.length - 1];

    if (typeof item === "string") {
      const itemLines = item.split("\n");
      words.push(...itemLines[0].split(" "));

      for (let j = 1, jLen = itemLines.length; j < jLen; j++) {
        words = [];
        lines.push(words);
        words.push(...itemLines[j].split(" "));
      }
    } else {
      words.push(item);
    }
  }

  const spaceWidth = this.context.measureText(" ").width;

  if (this.style.wordWrap) {
    lines = runWordWrap(this, lines, lineHeight);
  }

  let drawnLines = lines.length;

  if (this.style.maxLines > 0 && this.style.maxLines < lines.length) {
    drawnLines = this.style.maxLines;
  }

  this._charCount = 0;

  for (let i = 0; i < drawnLines; i++) {
    const words = lines[i];
    let lineWidth = this.style.strokeThickness + this.padding.x;

    for (let j = 0, jLen = words.length; j < jLen; j++) {
      const word = words[j];

      if (word instanceof TextIcon) {
        lineWidth += getIconWidth(word, lineHeight);
      } else {
        lineWidth += j === 0 || words[j - 1] instanceof TextIcon ? 0 : spaceWidth;
        lineWidth += this.context.measureText(word).width;
      }
    }

    lineWidths[i] = Math.ceil(lineWidth);
    maxLineWidth = Math.max(maxLineWidth, lineWidths[i]);
  }

  //  Calculate text height
  let height = lineHeight * drawnLines;
  let lineSpacing = this._lineSpacing;

  if (lineSpacing < 0 && Math.abs(lineSpacing) > lineHeight) {
    lineSpacing = -lineHeight;
  }

  //  Adjust for line spacing
  if (lineSpacing !== 0) {
    height += (lineSpacing > 0) ? lineSpacing * lines.length : lineSpacing * (lines.length - 1);
  }

  const isWithinLimits = maxLineWidth <= this.maxWidth && height <= this.maxHeight;

  if (!isWithinLimits && fit) {
    if (adjusted || this.wordWrap) {
      const fontSize = parseInt(this.fontSize, 10);

      if (fontSize > 1) {
        this.fontSize = `${fontSize - 1}px`;
        this.updateText(true);

        return;
      }
    } else {
      const scale = Math.min(this.maxWidth / maxLineWidth, this.maxHeight / height);
      this.fontSize = `${Math.floor(this._maxFontSize * scale)}px`;
      this.updateText(true);

      return;
    }
  }

  this.canvas.width = Math.ceil(maxLineWidth * this._res / 2) * 2;
  this.canvas.height = Math.ceil(height * this._res / 2) * 2;
  this.context.scale(this._res, this._res);

  if (navigator.isCocoonJS) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  if (this.style.backgroundColor) {
    this.context.fillStyle = this.style.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  this.context.fillStyle = this.style.fill;
  this.context.font = this.style.font;
  this.context.strokeStyle = this.style.stroke;
  this.context.textBaseline = "alphabetic";

  this.context.lineWidth = this.style.strokeThickness;
  this.context.lineCap = "round";
  this.context.lineJoin = "round";

  let linePositionX;
  let linePositionY;

  this._charCount = 0;

  //  Draw text line by line
  for (let i = 0; i < drawnLines; i++) {
    //  Split the line by

    linePositionX = this.style.strokeThickness / 2;
    linePositionY = (this.style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

    if (i > 0) {
      linePositionY += (lineSpacing * i);
    }

    if (this.style.align === "right") {
      linePositionX += maxLineWidth - lineWidths[i];
    } else if (this.style.align === "center") {
      linePositionX += (maxLineWidth - lineWidths[i]) / 2;
    }

    if (this.autoRound) {
      linePositionX = Math.round(linePositionX);
      linePositionY = Math.round(linePositionY);
    }

    const words = lines[i];
    let x = linePositionX;
    let y = linePositionY;

    for (let j = 0, jLen = words.length; j < jLen; j++) {
      let word = words[j];

      if (typeof word === "string") {
        while (typeof words[j + 1] === "string") {
          word += ` ${words[j + 1]}`;
          j += 1;
        }

        if (this.style.stroke && this.style.strokeThickness) {
          this.updateShadow(this.style.shadowStroke);
          this.context.strokeText(word, x, y);
        }

        if (this.style.fill) {
          this.updateShadow(this.style.shadowFill);
          this.context.fillText(word, x, y);
        }

        x += this.context.measureText(word).width;
      } else {
        const width = getIconWidth(word, lineHeight);
        const height = lineHeight * word.scaleY;
        const frame = word.frame;

        this.context.drawImage(
          word.image.data,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          frame.spriteSourceSizeX + x + word.x,
          frame.spriteSourceSizeY + y + word.y - height * 0.7,
          width,
          height,
        );

        x += width;
      }
    }
  }

  this.updateTexture();
  this.dirty = false;
};

function getIconWidth(icon, lineHeight) {
  return icon.frame.sourceSizeW * icon.scaleX * lineHeight / icon.frame.sourceSizeH;
}

function runWordWrap(textObject, lines, lineHeight) {
  const spaceWidth = textObject.context.measureText(" ").width;
  const result = [[]];

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i];
    let spaceLeft = textObject.style.wordWrapWidth;

    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      const wordWidth = typeof word === "string" ? textObject.context.measureText(word).width :
        getIconWidth(word, lineHeight);
      const wordWidthWithSpace = wordWidth + spaceWidth;

      if (wordWidthWithSpace > spaceLeft) {
        // Skip printing the newline if it's the first word of the line that is greater than the word wrap width.
        if (j > 0) {
          result.push([]);
        }
        result[result.length - 1].push(word);
        spaceLeft = textObject.style.wordWrapWidth - wordWidth;
      } else {
        spaceLeft -= wordWidthWithSpace;
        result[result.length - 1].push(word);
      }
    }

    if (i < lines.length - 1) {
      result.push([]);
    }
  }

  return result;
}
