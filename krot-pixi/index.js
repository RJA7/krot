let PIXI = null;

const init = (Library) => PIXI = Library;

const containsLetter = (text) => /[A-Za-z]/.test(text);

const handlerMap = {
  class: (layout, item, object) => {
    const classNames = item.class.split(/\s+/).filter(v => v);

    for (let j = 0, kLen = classNames.length; j < kLen; j++) {
      layout[classNames[j]].push(object);
    }
  },

  parent: (layout, item, object) => {
    const parent = layout[item.parent];
    parent && parent.addChild(object);
  },

  text: (layout, item, object) => {
    object.text = containsLetter(item.text) ? populate.localize(item.text) : item.text;
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
    const classNames = item.class.split(/\s+/).filter(v => v);

    for (let j = 0, kLen = classNames.length; j < kLen; j++) {
      const className = classNames[j];
      layout[className] = layout[className] || [];
    }

    if (
      filter[name] ||
      classNames.find(className => filter[className]) ||
      (item.parent && !layout[item.parent])
    ) continue;

    const props = Object.keys(item);
    const object = item.Create(PIXI);

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

module.exports = { init, populate, handlerMap };
