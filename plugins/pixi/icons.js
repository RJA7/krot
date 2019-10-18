module.exports = {
  getFields(icon) {
    return [
      {
        prop: 'key',
        descriptor: {
          set(v) {
            if (!v || icon.textObject.icons[v]) return;
            delete icon.textObject.icons[icon.key];
            icon.key = v;
            icon.textObject.icons[icon.key] = icon;
            icon.textObject.dirty = true;
          },
          get() {
            return icon.key;
          },
        },
      },
      {
        prop: 'x',
        step: 1,
        descriptor: {
          set(v) {
            icon.x = v;
            icon.textObject.dirty = true;
          },
          get() {
            return icon.x;
          },
        },
      },
      {
        prop: 'y',
        step: 1,
        descriptor: {
          set(v) {
            icon.y = v;
            icon.textObject.dirty = true;
          },
          get() {
            return icon.y;
          },
        },
      },
      {
        prop: 'scale.x',
        step: floatPrecision,
        descriptor: {
          set(v) {
            icon.scale.x = v;
            icon.textObject.dirty = true;
          },
          get() {
            return icon.scale.x;
          },
        },
      },
      {
        prop: 'scale.y',
        step: floatPrecision,
        descriptor: {
          set(v) {
            icon.scale.y = v;
            icon.textObject.dirty = true;
          },
          get() {
            return icon.scale.y;
          },
        },
      },
      {
        prop: 'texture',
        descriptor: {
          set(v) {
            if (!PIXI.utils.TextureCache[v]) return;
            icon.texture = PIXI.Texture.from(v);
            icon.textObject.dirty = true;
          },
          get() {
            return icon.texture.textureCacheIds[0] || '';
          },
        },
      },
      {
        prop: 'remove', descriptor: {
          value: () => {
            icon.destroy();
            delete icon.textObject.icons[icon.key];
            icon.textObject.dirty = true;
            new krot.Controller(icon.textObject);
          },
        },
      },
    ];
  },
  debug() {
    //
  },
};
