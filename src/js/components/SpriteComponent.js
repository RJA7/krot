const {floatPrecision, getParentField, debugPosition} = require('./common');

module.exports = class SpriteComponent {
  constructor() {
    this.type = 'Sprite';
  }

  getInitialModel() {
    return {
      x: 0,
      y: 0,
      anchor: {x: 0, y: 0},
      scale: {x: 0, y: 0},
      angle: 0,
      alpha: 1,
      visible: true,
      tint: 0xffffff,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      interactive: false,
      buttonMode: false,
      texture: '',
    };
  }

  getControls() {
    return [
      {prop: 'name'},
      {prop: 'x', step: 1},
      {prop: 'y', step: 1},
      {prop: 'anchor.x', step: floatPrecision},
      {prop: 'anchor.y', step: floatPrecision},
      {prop: 'scale.x', step: floatPrecision},
      {prop: 'scale.y', step: floatPrecision},
      {prop: 'angle', step: floatPrecision},
      {prop: 'alpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'visible'},
      {prop: 'tint', color: true},
      {prop: 'blendMode', list: PIXI.BLEND_MODES},
      {prop: 'interactive'},
      {prop: 'buttonMode'},
      getParentField(),
      {
        prop: 'texture',
        descriptor: {
          set: (texture) => {
            if (!PIXI.utils.TextureCache[texture]) return;
            krot.updateItem({texture});
          },
          get: () => {
            return krot.getModel().texture;
          },
        },
      },
    ];
  }

  render(view, model, prevModel) {
    view.x = model.x;
    view.y = model.y;
    view.anchor.x = model.anchor.x;
    view.anchor.y = model.anchor.y;
    view.scale.x = model.scale.x;
    view.scale.y = model.scale.y;
    view.angle = model.angle;
    view.alpha = model.alpha;
    view.visible = model.visible;
    view.tint = model.tint;
    view.blendMode = model.blendMode;
    view.interactive = model.interactive;
    view.buttonMode = model.buttonMode;

    if (model.parent !== prevModel.parent) {
      const parent = krot.getModel(model.parent);
      parent.addChild(view);
    }

    if (model.texture !== prevModel.texture) {
      view.texture = PIXI.Texture.from(model.texture);
    }
  }

  debug(object, graphics) {
    debugPosition(object, graphics);
  }
};
