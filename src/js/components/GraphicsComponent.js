const {floatPrecision, debugPosition} = require('./common');

module.exports = class GraphicsComponent {
  constructor() {
    this.type = 'Graphics';
  }

  createView() {
    return new PIXI.Graphics();
  }

  getInitialModel() {
    return {
      name: '',
      x: 0,
      y: 0,
      scale: {x: 1, y: 1},
      pivot: {x: 0, y: 0},
      angle: 0,
      alpha: 1,
      visible: true,
      tint: 0xffffff,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      interactive: false,
      buttonMode: false,
      parent: '',
    };
  }

  getControls() {
    return [
      {prop: 'name'},
      {prop: 'x', step: 1},
      {prop: 'y', step: 1},
      {prop: 'scale.x', step: floatPrecision},
      {prop: 'scale.y', step: floatPrecision},
      {prop: 'pivot.x', step: floatPrecision},
      {prop: 'pivot.y', step: floatPrecision},
      {prop: 'angle', step: floatPrecision},
      {prop: 'alpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'visible'},
      {prop: 'tint', color: true},
      {prop: 'blendMode', list: PIXI.BLEND_MODES},
      {prop: 'interactive'},
      {prop: 'buttonMode'},
    ];
  }

  render(view, model, prevModel = {}) {
    view.x = model.x;
    view.y = model.y;
    view.scale.x = model.scale.x;
    view.scale.y = model.scale.y;
    view.pivot.x = model.pivot.x;
    view.pivot.y = model.pivot.y;
    view.angle = model.angle;
    view.alpha = model.alpha;
    view.visible = model.visible;
    view.tint = model.tint;
    view.blendMode = model.blendMode;
    view.interactive = model.interactive;
    view.buttonMode = model.buttonMode;

    if (model.texture !== prevModel.texture) {
      view.texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;
    }
  }

  debug(view, graphics) {
    debugPosition(view, graphics);
  }
};
