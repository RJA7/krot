const {floatPrecision, debugPosition} = require('./common');
const IconComponent = require('./IconComponent');

const baseLineList = ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'];

module.exports = class TextComponent {
  constructor() {
    this.type = 'Text';
    this.iconComponent = new IconComponent();

    app.onDataChange.add((data, prevData) => {
      if (data.minorComponent === this.iconComponent && data.modelId !== prevData.modelId) {
        app.setData({minorComponent: null, minorComponentData: null});
      }
    });
  }

  createView() {
    return new PIXI.Text();
  }

  getInitialModel() {
    return {
      name: '',
      x: 0,
      y: 0,
      anchor: {x: 0, y: 0},
      scale: {x: 1, y: 1},
      angle: 0,
      alpha: 1,
      visible: true,
      blendMode: PIXI.BLEND_MODES.NORMAL,
      interactive: false,
      buttonMode: false,
      text: '',
      localize: true,
      maxWidth: 0,
      maxHeight: 0,
      maxFontSize: 0,
      icons: [],
      style: new PIXI.TextStyle(),
      parent: '',
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
      {prop: 'blendMode', list: PIXI.BLEND_MODES},
      {prop: 'interactive'},
      {prop: 'buttonMode'},
      {prop: 'text'},
      {prop: 'localize'},
      {prop: 'style.fontSize', name: 'fontSize', step: 1},
      {prop: 'style.fontWeight', name: 'fontWeight', list: ['normal', 'bold', 'bolder', 'lighter']},
      {prop: 'style.fontFamily', name: 'fontFamily', list: app.renderer.fonts},
      {prop: 'style.fill', name: 'fill'},
      {prop: 'style.stroke', name: 'stroke'},
      {prop: 'style.strokeThickness', name: 'strokeThickness', step: 1},
      {prop: 'style.align', name: 'align', list: ['left', 'center', 'right']},
      {prop: 'style.wordWrap', name: 'wrap'},
      {prop: 'style.wordWrapWidth', name: 'wrapWidth', step: 1},
      {prop: 'style.breakWords', name: 'breakWords'},
      {prop: 'style.lineHeight', name: 'lineHeight', step: 1},
      {prop: 'style.padding', name: 'padding', step: 1},
      {prop: 'style.fontStyle', name: 'fontStyle', list: ['normal', 'italic', 'oblique']},
      {prop: 'style.dropShadow', name: 'shadow'},
      {prop: 'style.dropShadowAlpha', name: 'shadowAlpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'style.dropShadowAngle', name: 'shadowAngle', step: floatPrecision},
      {prop: 'style.dropShadowBlur', name: 'shadowBlur', step: 1},
      {prop: 'style.dropShadowColor', name: 'shadowColor'},
      {prop: 'style.dropShadowDistance', name: 'shadowDistance', step: 1},
      {prop: 'style.leading', name: 'leading', step: 1},
      {prop: 'style.lineJoin', name: 'lineJoin', list: ['miter', 'round', 'bevel']},
      {prop: 'style.miterLimit', name: 'miterLimit', step: 1},
      {prop: 'style.trim', name: 'trim'},
      {prop: 'style.textBaseline', name: 'baseline', list: baseLineList},
      {prop: 'style.whiteSpace', name: 'whiteSpace', list: ['normal', 'pre', 'pre-line']},
      {prop: 'style.fontVariant', name: 'fontVariant', list: ['normal', 'small-caps']},
      {prop: 'style.letterSpacing', name: 'letterSpacing', step: 1},
      {prop: 'maxWidth', min: 0, step: 1},
      {prop: 'maxHeight', min: 0, step: 1},
      {prop: 'maxFontSize', min: 1, step: 1},
      {
        prop: 'icons',
        name: '+ Add icon',
        descriptor: {
          value: () => {
            const iconModel = this.iconComponent.getInitialModel();
            const icons = [...app.getModel().icons, iconModel];
            app.updateItem({icons}, true);
            app.setData({minorComponent: this.iconComponent, minorComponentData: icons.length - 1});
          },
        },
      },
      ...app.getModel().icons.map((icon, index) => ({
        prop: icon.key,
        descriptor: {
          value: () => {
            app.setData({minorComponent: this.iconComponent, minorComponentData: index});
          },
        },
      })),
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
    view.blendMode = model.blendMode;
    view.interactive = model.interactive;
    view.buttonMode = model.buttonMode;
    view.maxWidth = model.maxWidth;
    view.maxHeight = model.maxHeight;
    view.maxFontSize = model.maxFontSize;
    view.text = model.text;

    if (model.icons !== prevModel.icons) {
      view.icons = model.icons.reduce((acc, icon) => {
        const iconView = new PIXI.Sprite();
        iconView.x = icon.x;
        iconView.y = icon.y;
        iconView.scale.x = icon.scale.x;
        iconView.scale.y = icon.scale.y;
        acc[icon.key] = iconView;

        iconView.texture = PIXI.utils.TextureCache[model.texture] || app.renderer.noTexture;

        return acc;
      }, {});
    }

    if (model.text !== prevModel.text) {
      view.text = model.text.replace(/\\n/g, '\n');
    }

    if (model.style !== prevModel.style) {
      view.style = model.style;
    }
  }

  drawRect(view, graphics, localLT, localRB) {
    const [lt, rt, rb, lb] = [
      [localLT.x, localLT.y],
      [localRB.x, localLT.y],
      [localRB.x, localRB.y],
      [localLT.x, localRB.y],
    ].map((x, y) => graphics.toLocal(new PIXI.Point(x, y), view));

    graphics.lineStyle(1, 0xA9B7C6, 1);
    graphics.moveTo(lb.x, lb.y);
    [lt, rt, rb, lb].forEach((pos) => graphics.lineTo(pos.x, pos.y));
  }

  debug(view, graphics) {
    {
      const localLT = new PIXI.Point(-view.anchor.x * view.canvas.width, -view.anchor.y * view.canvas.height);
      const localRB = new PIXI.Point((1 - view.anchor.x) * view.canvas.width, (1 - view.anchor.y) * view.canvas.height);
      this.drawRect(view, graphics, localLT, localRB);
    }

    {
      const localLT = new PIXI.Point(-view.anchor.x * view.maxWidth, -view.anchor.y * view.maxHeight);
      const localRB = new PIXI.Point((1 - view.anchor.x) * view.maxWidth, (1 - view.anchor.y) * view.maxHeight);
      this.drawRect(view, graphics, localLT, localRB);
    }

    debugPosition(view, graphics);
  }
};
