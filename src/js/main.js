const {ipcRenderer} = require("electron");
const WebFont = require("webfontloader");
const {fonts} = require("./config");
const Krot = require("./krot");
const db = require("electron-db");
const path = require("path");
const fs = require("fs");


class State extends Phaser.State {
  init() {
    game.stage.backgroundColor = "#888888";
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.setResizeCallback(() => game.scale.setMaximum());
  }

  preload() {
    db.getRows("settings", process.cwd(), {}, this.loadAssets.bind(this));
  }

  async loadAssets(success, result) {
    const promises = [];
    const settings = result[0];

    settings.imagesDirs.forEach((dir) => {
      fs.readdirSync(dir).forEach((fileName) => {
        game.load.image(fileName.split(".").shift(), `${dir}${path.sep}${fileName}`);
      });
    });

    settings.atlasesDirs.forEach((dir) => {
      fs.readdirSync(dir).forEach((fileName) => {
        if (fileName.endsWith(".json")) return;
        const name = fileName.split(".").shift();
        game.load.atlas(name, `${dir}${path.sep}${fileName}`, `${dir}${path.sep}${name}.json`, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
      });
    });

    settings.fontsDirs.forEach((dir) => {
      fs.readdirSync(dir).forEach((fileName) => {
        const [name] = fileName.split(".");
        const fontFace = new FontFace(name, `url(${dir}${path.sep}${fileName})`.replace(/\\/g, "/"));

        promises.push(
          fontFace.load().then((loadedFace) => {
            document.fonts.add(loadedFace);
            fonts.push(name);
          }),
        );
      });
    });

    settings.googleFonts.length && promises.push(new Promise(resolve => {
      WebFont.load({
        active: resolve,
        inactive: resolve,
        google: {
          families: settings.googleFonts,
        },
      });
    }));

    fonts.push(...settings.standardFonts, ...settings.googleFonts);
    promises.push(new Promise(resolve => game.load.onLoadComplete.add(resolve)));

    game.load.start();

    await Promise.all(promises);
  }

  create() {
    const krot = new Krot();

    ["new", "open", "save", "saveAs", "undo", "redo", "moveDown", "moveUp", "clone", "destroy", "group", "sprite", "text"]
      .forEach((eventName) => {
        ipcRenderer.on(eventName, (event, data) => {
          krot[eventName](/*data.msg*/);
        });
      });
  }
}

window.game = new Phaser.Game(10, 10, Phaser.CANVAS, "", State);
