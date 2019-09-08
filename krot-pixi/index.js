let PIX = null;

const init = (PIXI) => PIX = PIXI;

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

    text: (raw, object) => {
      object.text = containsLetter(raw.text) ? populate.localize(raw.text) : raw.text;
    },

    texture: (raw, object) => {
      object.texture = PIX.Texture.from(raw.texture);
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
    const object = new PIX[raw.type]();
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

module.exports = {populate, init};
