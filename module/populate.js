// import { TextIcon } from "./text-icon";
//
// const iconsFromJSON = (json) => {
//   const raw = JSON.parse(json);
//
//   return Object.keys(raw).reduce((acc, key) => {
//     const value = raw[key];
//     acc[key] = new TextIcon(value.texture, value.x, value.y, value.scaleX, value.scaleY);
//
//     return acc;
//   }, {});
// };

const PIXI = require('pixi.js');

const containsLetter = (text) => /[A-Za-z]/.test(text);

const populate = (layout, rawUi, filter = {}) => {
  const list = rawUi.list;

  const handlerMap = {
    class: (raw, object) => {
      const classNames = raw.class.split(/\s+/).filter(v => v);

      for (let k = 0, kLen = classNames.length; k < kLen; k++) {
        const className = classNames[k];
        layout[className] = layout[className] || [];
        layout[className].push(object);
      }
    },

    parent: (raw, object) => {
      const parent = layout[raw.parent];
      parent && parent.addChild(object);
    },

    icons: (raw, object) => {
      // object.icons = iconsFromJSON(raw.icons);
    },

    text: (raw, object) => {
      object.text = containsLetter(raw.text) ? populate.localize(raw.text) : raw.text;
    },

    texture: (raw, object) => {
      object.texture = PIXI.Texture.from(raw.texture);
    },

    style: (raw, object) => Object.assign(object.style, raw.style),
    anchor: (raw, object) => Object.assign(object.anchor, raw.anchor),
    scale: (raw, object) => Object.assign(object.scale, raw.scale),
  };

  for (let i = 0, iLen = list.length; i < iLen; i++) {
    const raw = list[i];
    const name = raw.name;
    const classNames = raw.class.split(/\s+/);

    if (
      filter[name] ||
      classNames.find(className => filter[className]) ||
      (raw.parent && !layout[raw.parent])
    ) continue;

    const props = Object.keys(raw);
    const object = new PIXI[raw.type]();
    layout[name] = object;

    for (let j = 0, jLen = props.length; j < jLen; j++) {
      const prop = props[j];
      const handler = handlerMap[prop];

      if (handler) {
        handler(raw, object);
      } else {
        object[prop] = raw[prop];
      }
    }
  }
};

populate.localize = (string) => string;

module.exports = {populate};
