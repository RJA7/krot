const floatPrecision = 0.001;

const getNameField = (object) => ({
  prop: 'name',
  descriptor: {
    set: (value) => {
      if (!value || krot.hash[value]) return;
      object.name = value;
      krot.refreshTreeAndHash();
    },
    get: () => object.name,
  },
});

const getParentField = (object) => ({
  prop: 'parent',
  list: (() => {
    const hash = {...krot.hash};

    const filter = (object) => {
      delete hash[object.name];
      object.children.forEach(filter);
    };

    filter(object);
    return Object.keys(hash);
  })(),
  descriptor: {
    set: (value) => {
      const parent = krot.hash[value];
      parent.addChild(object);
      krot.refreshTreeAndHash();
    },
    get: () => object.parent.name || '',
  },
});

const debugPosition = (object, graphics) => {
  const position = graphics.toLocal(object, object.parent);
  graphics.beginFill(0xA9B7C6, 1);
  graphics.drawCircle(position.x, position.y, 4);
  graphics.endFill();
};

module.exports = {
  floatPrecision,
  getNameField,
  getParentField,
  debugPosition,
};
