const floatPrecision = 0.001;

const getNameField = (object) => ({
  prop: 'name',
  descriptor: {
    set: (value) => {
      if (!value || app.krot.hash[value] || app.krot.classesHash[value]) return;
      object.name = value;
      app.krot.refreshTreeAndHash();
    },
    get: () => object.name,
  },
});

const getClassField = (object) => ({
  prop: 'class',
  descriptor: {
    set: (value) => object.raw.class = value,
    get: () => object.raw.class || '',
  },
});

const getParentField = (object) => ({
  prop: 'parent',
  list: (() => {
    const hash = Object.assign({}, app.krot.hash);

    const filter = (object) => {
      delete hash[object.name];
      object.children.forEach(filter);
    };

    filter(object);
    return Object.keys(hash);
  })(),
  descriptor: {
    set: (value) => {
      const parent = app.krot.hash[value];
      parent.addChild(object);
      app.krot.refreshTreeAndHash();
    },
    get: () => object.parent.name || '',
  },
});

const debugPosition = (object, graphics) => {
  const position = graphics.toLocal(object, object.parent);
  graphics.beginFill(0x000000, 1);
  graphics.drawCircle(position.x, position.y, 4);
};

module.exports = {
  debug: true,
  floatPrecision,
  getNameField,
  getClassField,
  getParentField,
  debugPosition,
};
