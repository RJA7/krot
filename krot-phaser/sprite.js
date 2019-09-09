const {getKeyAndFrameName, getImageByTextureName} = require("./utils");

const Sprite = Phaser.Sprite;

Phaser.Sprite = function (...args) {
  Sprite.call(this, ...args);

  this._terms = [];
  this._scaleTween = null;
  this.scaleOnClick = false;
  this.events.onInputDown.add(handleInputDown, this);
};

Object.assign(Phaser.Sprite, Sprite);
Phaser.Sprite.prototype = Object.create(Sprite.prototype);

Object.defineProperty(Phaser.Sprite.prototype, "textureName", {
  set(textureName) {
    const keyAndFrameName = getKeyAndFrameName(textureName);

    if (!keyAndFrameName) return;

    const [key, frameName] = keyAndFrameName;

    if (key !== this.key) {
      this.loadTexture(key);
    }

    this.frameName = frameName;
  },

  get() {
    const image = getImageByTextureName(this.key);
    return image.frameData.getFrames().length === 1 ? this.key : this.frameName;
  },
});

Object.defineProperty(Phaser.Sprite.prototype, "inputEnabled", {
  set(v) {
    Phaser.Component.InputEnabled.prototype.inputEnabled.set.call(this, v);

    if (this.input) {
      this.input.useHandCursor = true;﻿
    }
  },

  get() {
    return Phaser.Component.InputEnabled.prototype.inputEnabled.get.call(this);
  },
});

Phaser.Sprite.prototype.addTerm = function (callback, context) {
  this._terms.push([callback, context]);
};

function checkTerms(terms) {
  for (let i = 0, l = terms.length; i < l; i++) {
    if (!terms[i][0].call(terms[i][1])) {
      return false;
    }
  }

  return true;
}

function handleInputDown() {
  if (!checkTerms(this._terms)) {
    return false;
  }

  if (this.scaleOnClick && !this._scaleTween) {
    this._scaleTween = this.game.add.tween(this.scale)
      .to({x: "+0.1", y: "+0.1"}, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true)
      .onComplete
      .add(() => this._scaleTween = null);
  }
}
