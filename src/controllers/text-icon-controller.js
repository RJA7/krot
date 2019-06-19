import { TextIcon } from "../../../cookie-crush-2/lib/krot/text-icon";
import { GUI } from "dat.gui";

export class TextIconController {
  constructor(refreshIconsFolder) {
    const gui = new GUI({width: 300});
    const self = this;

    this.iconKey = "default";
    this.object = {icon: {[this.iconKey]: {}}};

    gui.add({
      set key(v) {
        if (self.object.icon[v]) return;
        const icon = self.object.icon[self.iconKey];
        delete self.object.icon[self.iconKey];
        self.iconKey = v;
        self.object.icon[self.iconKey] = icon;
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
      this.object.icon[this.iconKey][prop] = defaults;

      Object.defineProperty(this, prop, {
        set: (v) => {
          const item = this.object.icon[this.iconKey];
          item[prop] = v;

          this.object.icon = {
            ...this.object.icon,
            [this.iconKey]: new TextIcon(item.texture, item.x, item.y, item.scaleX, item.scaleY),
          };
        },
        get: () => {
          return this.object.icon[this.iconKey][prop];
        }
      });

      gui.add(this, prop);
    });

    gui.add({
      remove: () => {
        if (!confirm("Remove icon?")) return;
        delete this.object.icon[this.iconKey];
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
