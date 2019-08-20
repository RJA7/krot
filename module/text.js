const {Text, TextMetrics, utils} = require('pixi.js');

module.exports.Text = class extends Text {
  constructor(text, style, canvas) {
    super(text, style, canvas);

    this._maxWidth = 0;
    this._maxHeight = 0;
    this._maxFontSize = 0;
    this._icons = [];
  }

  updateText(respectDirty, adjusted = false) {
    var style = this._style;

    // check if style has changed..
    if (this.localStyleID !== style.styleID) {
      this.dirty = true;
      this.localStyleID = style.styleID;
    }

    if (!this.dirty && respectDirty) {
      return;
    }

    const fit = this._maxWidth !== 0 && this._maxHeight !== 0 && this._maxFontSize !== 0;

    if (!adjusted && fit) {
      this._style.fontSize = this._maxFontSize;
    }

    this._font = this._style.toFontString();

    var context = this.context;
    var measured = TextMetrics.measureText(this._text || ' ', this._style, this._style.wordWrap, this.canvas);
    var width = measured.width;
    var height = measured.height;
    var lines = measured.lines;
    var lineHeight = measured.lineHeight;
    var lineWidths = measured.lineWidths;
    var maxLineWidth = measured.maxLineWidth;
    var fontProperties = measured.fontProperties;

    const canvasWidth = Math.ceil((Math.max(1, width) + (style.padding * 2)) * this._resolution);
    const canvasHeight = Math.ceil((Math.max(1, height) + (style.padding * 2)) * this._resolution);
    const isWithinLimits = canvasWidth <= this._maxWidth && canvasHeight <= this._maxHeight;

    if (!isWithinLimits && fit) {
      if (adjusted || this._style.wordWrap) {
        if (this._style.fontSize > 1) {
          this._style.fontSize = this._style.fontSize - 1;
          this.updateText(false, true);

          return;
        }
      } else {
        const scale = Math.min(this._maxWidth / maxLineWidth, this._maxHeight / canvasHeight);
        this._style.fontSize = Math.floor(this._style.fontSize * scale);
        this.updateText(false, true);

        return;
      }
    }

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    context.scale(this._resolution, this._resolution);

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.font = this._font;
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;

    var linePositionX;
    var linePositionY;

    // require 2 passes if a shadow; the first to draw the drop shadow, the second to draw the text
    var passesCount = style.dropShadow ? 2 : 1;

    // For v4, we drew text at the colours of the drop shadow underneath the normal text. This gave the correct zIndex,
    // but features such as alpha and shadowblur did not look right at all, since we were using actual text as a shadow.
    //
    // For v5.0.0, we moved over to just use the canvas API for drop shadows, which made them look much nicer and more
    // visually please, but now because the stroke is drawn and then the fill, drop shadows would appear on both the fill
    // and the stroke; and fill drop shadows would appear over the top of the stroke.
    //
    // For v5.1.1, the new route is to revert to v4 style of drawing text first to get the drop shadows underneath normal
    // text, but instead drawing text in the correct location, we'll draw it off screen (-paddingY), and then adjust the
    // drop shadow so only that appears on screen (+paddingY). Now we'll have the correct draw order of the shadow
    // beneath the text, whilst also having the proper text shadow styling.
    for (var i = 0; i < passesCount; ++i) {
      var isShadowPass = style.dropShadow && i === 0;
      var dsOffsetText = isShadowPass ? height * 2 : 0; // we only want the drop shadow, so put text way off-screen
      var dsOffsetShadow = dsOffsetText * this.resolution;

      if (isShadowPass) {
        // On Safari, text with gradient and drop shadows together do not position correctly
        // if the scale of the canvas is not 1: https://bugs.webkit.org/show_bug.cgi?id=197689
        // Therefore we'll set the styles to be a plain black whilst generating this drop shadow
        context.fillStyle = 'black';
        context.strokeStyle = 'black';

        var dropShadowColor = style.dropShadowColor;
        var rgb = utils.hex2rgb(typeof dropShadowColor === 'number' ? dropShadowColor : utils.string2hex(dropShadowColor));

        context.shadowColor = 'rgba(' + (rgb[0] * 255) + ',' + (rgb[1] * 255) + ',' + (rgb[2] * 255) + ',' + (style.dropShadowAlpha) + ')';
        context.shadowBlur = style.dropShadowBlur;
        context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        context.shadowOffsetY = (Math.sin(style.dropShadowAngle) * style.dropShadowDistance) + dsOffsetShadow;
      } else {
        // set canvas text styles
        context.fillStyle = this._generateFillStyle(style, lines);
        context.strokeStyle = style.stroke;

        context.shadowColor = 0;
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
      }

      // draw lines line by line
      for (var i$1 = 0; i$1 < lines.length; i$1++) {
        linePositionX = style.strokeThickness / 2;
        linePositionY = ((style.strokeThickness / 2) + (i$1 * lineHeight)) + fontProperties.ascent;

        if (style.align === 'right') {
          linePositionX += maxLineWidth - lineWidths[i$1];
        } else if (style.align === 'center') {
          linePositionX += (maxLineWidth - lineWidths[i$1]) / 2;
        }

        if (style.stroke && style.strokeThickness) {
          this.drawLetterSpacing(
            lines[i$1],
            linePositionX + style.padding,
            linePositionY + style.padding - dsOffsetText,
            true,
          );
        }

        if (style.fill) {
          this.drawLetterSpacing(
            lines[i$1],
            linePositionX + style.padding,
            linePositionY + style.padding - dsOffsetText,
          );
        }
      }
    }

    this.updateTexture();
  }

  get maxWidth() {
    return this._maxWidth;
  }

  set maxWidth(v) {
    this.dirty = true;
    this._maxWidth = v;
  }

  get maxHeight() {
    return this._maxHeight;
  }

  set maxHeight(v) {
    this.dirty = true;
    this._maxHeight = v;
  }

  get maxFontSize() {
    return this._maxFontSize;
  }

  set maxFontSize(v) {
    this.dirty = true;
    this._maxFontSize = v;
  }
};
