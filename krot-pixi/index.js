const textIcons = require('text-icons');
const textExtends = require('./extends/text');

let PIXI = null;

const init = (Library) => {
  PIXI = Library;

  textIcons.extend(PIXI.Text);
  textExtends.apply(PIXI);
};

const containsLetter = (text) => /[A-Za-z]/.test(text);

const canvas = document.createElement('canvas');

const handlerMap = {
  Container: () => new PIXI.Container(),
  Sprite: () => new PIXI.Sprite(),
  Text: () => new PIXI.Text(''),
  Graphics: () => new PIXI.Graphics(),
  NineSlicePlane: () => new PIXI.NineSlicePlane(PIXI.Texture.from(canvas)),

  parent: (layout, item, object) => {
    const parent = layout[item.parent];
    parent && parent.addChild(object);
  },

  text: (layout, item, object) => {
    object.text = containsLetter(item.text) ? populate.localize(item.text) : item.text;
  },

  icons: (layout, item, object) => {
    object.icons = {};

    for (const key in item.icons) {
      const icon = new PIXI.Sprite();
      const value = item.icons[key];
      icon.x = value.x;
      icon.y = value.y;
      icon.scale.x = value.scale.x;
      icon.scale.y = value.scale.y;
      icon.texture = PIXI.Texture.from(value.texture);
      object.icons[key] = icon;
    }
  },

  texture: (layout, item, object) => {
    object.texture = PIXI.Texture.from(item.texture);
  },

  style: (layout, item, object) => Object.assign(object.style, item.style),
  anchor: (layout, item, object) => Object.assign(object.anchor, item.anchor),
  scale: (layout, item, object) => Object.assign(object.scale, item.scale),

  rectProps: (layout, item, object) => {
    const [x, y, w, h, color, alpha] = item.rectProps.split(',').map((v) => Number(v));
    object.beginFill(color, alpha);
    object.drawRect(x, y, w, h);
  },
};

const populate = (layout, raw, filter = {}) => {
  const list = raw.list;

  for (let i = 0, iLen = list.length; i < iLen; i++) {
    const item = list[i];
    const name = item.name;

    if (
      filter[name] ||
      (item.parent && !layout[item.parent])
    ) continue;

    const props = Object.keys(item);
    const object = handlerMap[item.type]();

    layout[name] = object;

    for (let j = 0, jLen = props.length; j < jLen; j++) {
      const prop = props[j];
      const handler = handlerMap[prop];

      if (handler) {
        handler(layout, item, object);
      } else {
        object[prop] = item[prop];
      }
    }
  }
};

populate.localize = (string) => string;

module.exports = {init, populate, handlerMap};
