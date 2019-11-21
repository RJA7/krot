const {floatPrecision, debugPosition} = require('./common');

module.exports = class NineSlicePlaneComponent {
  constructor() {
    this.type = 'NineSlicePlane';
  }

  createView() {
    return new PIXI.NineSlicePlane(app.renderer.noTexture);
  }

  getInitialModel() {
    return {
      name: '',
      x: 0,
      y: 0,
      scale: {x: 1, y: 1},
      pivot: {x: 0, y: 0},
      width: 64,
      height: 64,
      leftWidth: 0,
      topHeight: 0,
      rightWidth: 0,
      bottomHeight: 0,
      angle: 0,
      alpha: 1,
      visible: true,
      tint: 0xffffff,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      interactive: false,
      buttonMode: false,
      texture: '',
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
      {prop: 'width', step: 1},
      {prop: 'height', step: 1},
      {prop: 'leftWidth', step: 1},
      {prop: 'topHeight', step: 1},
      {prop: 'rightWidth', step: 1},
      {prop: 'bottomHeight', step: 1},
      {prop: 'angle', step: floatPrecision},
      {prop: 'alpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'visible'},
      {prop: 'tint', color: true},
      {prop: 'blendMode', list: PIXI.BLEND_MODES},
      {prop: 'interactive'},
      {prop: 'buttonMode'},
      {
        prop: 'texture',
        descriptor: {
          set: (value) => {
            const prevValue = app.getModel().texture;
            const texture = PIXI.utils.TextureCache[value] || app.renderer.noTexture;
            const prevTexture = PIXI.utils.TextureCache[prevValue] || app.renderer.noTexture;

            if (texture !== prevTexture) {
              app.updateItem({texture: value, width: texture.width, height: texture.height});
            }
          },
          get: () => {
            return app.getModel().texture;
          },
        },
      },
    ];
  }

  render(view, model, prevModel = {}) {
    view.x = model.x;
    view.y = model.y;
    view.scale.x = model.scale.x;
    view.scale.y = model.scale.y;
    view.pivot.x = model.pivot.x;
    view.pivot.y = model.pivot.y;
    view.width = model.width;
    view.height = model.height;
    view.leftWidth = model.leftWidth;
    view.topHeight = model.topHeight;
    view.rightWidth = model.rightWidth;
    view.bottomHeight = model.bottomHeight;
    view.angle = model.angle;
    view.alpha = model.alpha;
    view.visible = model.visible;
    view.tint = model.tint;
    view.blendMode = model.blendMode;
    view.interactive = model.interactive;
    view.buttonMode = model.buttonMode;

    if (model.parent !== prevModel.parent) {
      const parent = app.renderer.getExistingView(model.parent);
      parent.addChild(view);
    }

    if (model.texture !== prevModel.texture) {
      view.texture = PIXI.utils.TextureCache[model.texture] ?
        PIXI.Texture.from(model.texture) : app.renderer.noTexture;
    }
  }

  debug(view, graphics) {
    const lt = new PIXI.Point(view.leftWidth, view.topHeight);
    const rt = new PIXI.Point(view.width - view.rightWidth, view.topHeight);
    const rb = new PIXI.Point(view.width - view.rightWidth, view.height - view.bottomHeight);
    const lb = new PIXI.Point(view.leftWidth, view.height - view.bottomHeight);

    graphics.lineStyle(1, 0xA9B7C6, 1);
    graphics.beginFill(0, 0);

    const start = graphics.toLocal(lb, view);
    graphics.moveTo(start.x, start.y);

    [lt, rt, rb, lb].forEach((local) => {
      const pos = graphics.toLocal(local, view);
      graphics.lineTo(pos.x, pos.y);
    });

    debugPosition(view, graphics);
  }
};
