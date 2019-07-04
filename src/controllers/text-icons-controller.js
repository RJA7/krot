import { TextIcon } from "../../../cookie-crush-2/lib/gt/text-icon";
import { GUI } from "dat.gui";

export class TextIconsController {
  constructor(refreshIconsFolder) {
    const gui = new GUI({width: 300});
    const self = this;

    this.iconKey = "default";
    this.object = {icons: {[this.iconKey]: {}}};

    gui.add({
      set key(v) {
        if (self.object.icons[v]) return;
        const icons = self.object.icons[self.iconKey];
        delete self.object.icons[self.iconKey];
        self.iconKey = v;
        self.object.icons[self.iconKey] = icons;
        self.object.dirty = true;
        refreshIconsFolder();
      },
      get key() {
        return self.iconKey;
      },
    }, "key");

    [
      {prop: "texture", defaults: ""},
      {prop: "x", defaults: 0},
      {prop: "y", defaults: 0},
      {prop: "scaleX", defaults: 1},
      {prop: "scaleY", defaults: 1},
    ].forEach(({prop, defaults}) => {
      this.object.icons[this.iconKey][prop] = defaults;

      Object.defineProperty(this, prop, {
        set: (v) => {
          const item = this.object.icons[this.iconKey];
          item[prop] = v;

          this.object.icons = {
            ...this.object.icons,
            [this.iconKey]: new TextIcon(item.texture, item.x, item.y, item.scaleX, item.scaleY),
          };
        },
        get: () => {
          return this.object.icons[this.iconKey][prop];
        }
      });

      gui.add(this, prop);
    });

    gui.add({
      remove: () => {
        if (!confirm("Remove icon?")) return;
        delete this.object.icons[this.iconKey];
        this.object.dirty = true;
        this.hide();
        refreshIconsFolder();
      }
    }, "remove");

    gui.hide();
    this.gui = gui;
  }

  setObject(object, iconKey) {
    this.object = object;
    this.iconKey = iconKey;
    this.gui.updateDisplay();
    this.show();
  }

  show() {
    this.gui.show();
  }

  hide() {
    this.gui.hide();
  }
}
