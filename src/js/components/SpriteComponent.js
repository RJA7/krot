module.exports = class SpriteComponent {
  constructor() {
    this.type = 'Sprite';
  }

  createView() {
    return new PIXI.Sprite();
  }

  createModel() {
    return {
      name: '',
      x: 0,
      y: 0,
      anchor: {x: 0, y: 0},
      scale: {x: 1, y: 1},
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
      {prop: 'anchor.x'},
      {prop: 'anchor.y'},
      {prop: 'scale.x'},
      {prop: 'scale.y'},
      {prop: 'width', descriptor: this.createWidthControlDescriptor(), step: 1},
      {prop: 'height', descriptor: this.createHeightControlDescriptor(), step: 1},
      {prop: 'angle'},
      {prop: 'alpha', min: 0, max: 1},
      {prop: 'visible'},
      {prop: 'tint', color: true},
      {prop: 'blendMode', list: PIXI.BLEND_MODES},
      {prop: 'interactive'},
      {prop: 'buttonMode'},
      {prop: 'texture'},
    ];
  }

  render(view, model, prevModel = {}) {
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

    if (model.texture !== prevModel.texture) {
      view.texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;
    }
  }

  createWidthControlDescriptor() {
    return {
      set(width) {
        const model = app.getModel();
        const texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;
        app.updateItem({scale: {...model.scale, x: width / texture.width}});
      },
      get() {
        const model = app.getModel();
        const texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;
        return texture.width * model.scale.x;
      },
    };
  }

  createHeightControlDescriptor() {
    return {
      set(height) {
        const model = app.getModel();
        const texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;
        app.updateItem({scale: {...model.scale, y: height / texture.height}});
      },
      get() {
        const model = app.getModel();
        const texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;
        return texture.height * model.scale.y;
      },
    };
  }

  debug(view, model, graphics) {
    //
  }
};
