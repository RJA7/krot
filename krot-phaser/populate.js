const {TextIcon} = require("./text-icon");

const iconsFromJSON = (json) => {
  const raw = JSON.parse(json);

  return Object.keys(raw).reduce((acc, key) => {
    const value = raw[key];
    acc[key] = new TextIcon(value.texture, value.x, value.y, value.scaleX, value.scaleY);

    return acc;
  }, {});
};

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
      object.icons = iconsFromJSON(raw.icons);
    },

    ignore: () => void 0,

    text: (raw, object) => {
      object.setText(containsLetter(raw.text) ? populate.localize(raw.text) : raw.text);
    },
  };

  for (let i = 0, iLen = list.length; i < iLen; i++) {
    const raw = list[i];
    const name = raw.name;
    const classNames = raw.class.split(/\s+/);

    if (
      raw.ignore ||
      filter[name] ||
      classNames.find(className => filter[className]) ||
      (raw.parent && !layout[raw.parent])
    ) continue;

    const props = Object.keys(raw);
    const object = new Phaser[raw.type](game);
    layout[name] = object;

    for (let j = 0, jLen = props.length; j < jLen; j++) {
      const prop = props[j];
      const value = raw[prop];
      const handler = handlerMap[prop];

      if (handler) {
        handler(raw, object);
      } else if (typeof value === "object") {
        const val = value || {};
        const keys = Object.keys(val);
        object[prop] = object[prop] || {};

        for (let k = 0, kLen = keys.length; k < kLen; k++) {
          const key = keys[k];
          object[prop][key] = val[key];
        }
      } else {
        object[prop] = value;
      }
    }
  }
};

populate.localize = (text) => text;

module.exports = {populate};
