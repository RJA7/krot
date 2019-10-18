function apply(PIXI) {
  const originalUpdateText = PIXI.Text.prototype.updateText;

  PIXI.Text.prototype.updateText = function (respectDirty) {
    if (!this.maxWidth || !this.maxHeight) {
      return originalUpdateText.call(this, respectDirty);
    }

    this.maxFontSize = this.maxFontSize || this.style.fontSize;
    this.style.wordWrapWidth = this.maxWidth;
    let adjusted = false;

    while (true) {
      this.style.fontSize = adjusted ? this.style.fontSize : this.maxFontSize;
      const measured = PIXI.TextMetrics
        .measureText(this.text || ' ', this.style, this.style.wordWrap, this.canvas);

      if (
        this.style.fontSize === 1 || (
          measured.width <= this.maxWidth &&
          measured.height <= this.maxHeight
        )
      ) break;

      if (this.style.wordWrap || adjusted) {
        this.style.fontSize -= 1;
      } else {
        const scale = Math.min(this.maxWidth / measured.width, this.maxHeight / measured.height);
        const size = this.style.fontSize * scale;
        this.style.fontSize = Math.max(1, Math.floor(size));
      }

      adjusted = true;
    }

    return originalUpdateText.call(this, respectDirty);
  };
}

module.exports = {apply};
