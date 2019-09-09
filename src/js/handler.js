const stringifyObject = require("stringify-object");
const {remote} = require("electron");
const path = require("path");
const fs = require("fs");

const token = "/* raw */";

class Handler {
  constructor(setRawUi, ground) {
    this.setRawUi = setRawUi;
    this.ground = ground;
    this.filePath = "";
    this.savedJson = "";
  }

  new() {
    this.filePath = "";
    this.savedJson = JSON.stringify(this.getRawUi());
  }

  isChanged() {
    return this.savedJson !== JSON.stringify(this.getRawUi());
  }

  open(cb) {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      filters: [{
        extensions: ["js", "ts"],
        name: "",
      }],
    }, (filePaths) => {
      if (!filePaths.length) return;

      const file = fs.readFileSync(filePaths[0], "utf8");
      let rawUi = null;

      try {
        eval(`rawUi = ${file.split(token)[1]}`);
        this.setRawUi(rawUi);
        this.filePath = filePaths[0];
        cb();
      } catch (e) {
        // noop
      }
    });
  }

  save(cb) {
    if (!this.filePath) {
      return this.saveAs(cb);
    }

    const classHash = {};
    const hash = {};

    const writeClasses = (classes, name) => classes.forEach(className => {
      classHash[className] = classHash[className] || [];
      classHash[className].push(name);
    });

    const getClassType = (className) => {
      const namesList = classHash[className];
      const hasGroup = namesList.find(name => hash[name].type === "Group");
      const hasSprite = namesList.find(name => hash[name].type === "Sprite");
      const hasText = namesList.find(name => hash[name].type === "Text");

      return hasGroup || hasSprite && hasText ? "Group" : hasSprite ? "Sprite" : "Text";
    };

    const data = this.getRawUi(writeClasses, hash);
    const fields = data.list.map(raw => raw.name);
    const classFields = Object.keys(classHash).filter(name => classHash[name].length !== 0);
    const fileName = this.filePath.split(path.sep).pop();
    const [layoutName, extension] = fileName.split(".");
    let file;

    if (extension === "js") {

      file = `import { populate } from "krot-phaser";

const rawUi = ${token}${stringifyObject(data)};${token}

export class ${layoutName} {
  constructor(filter) {
${fields.map(name => `    this.${name} = null;`).join("\n")}`
        + (classFields.length ? "\n\n" : "") +
        `${classFields.map(name => `    this.${name} = [];`).join("\n")}

    populate(this, rawUi, filter);
  }
}
`;

    } else {

      file = `import { populate } from "krot-phaser";

/* tslint:disable */
const rawUi = ${token}${stringifyObject(data)};${token}

export type ${layoutName}Filter = Partial<{
${[...fields, ...classFields].map(name => `  ${name}: boolean;`).join("\n")}
}>;

export class ${layoutName} {
${fields.map(name => `  public readonly ${name}: Phaser.${hash[name].type};`).join("\n")}`
        + (classFields.length ? "\n\n" : "") +
        `${classFields.map(name => `  public readonly ${name}: Phaser.${getClassType(name)}[];`).join("\n")}

  constructor(filter?: ${layoutName}Filter) {
    populate(this, rawUi, filter);
  }
}
`;

    }

    fs.writeFile(this.filePath, file, () => {
      this.savedJson = JSON.stringify(data);
      cb && cb();
    });
  }

  saveAs(cb) {
    remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      filters: [
        {
          extensions: ["js"],
          name: "",
        },
        {
          extensions: ["ts"],
          name: "",
        },
      ],
    }, (filePath) => {
      if (!filePath) return;
      this.filePath = filePath;
      this.save(cb);
    });
  }

  getRawUi(writeClasses = () => "", hash = {}) {
    const data = {
      width: this.ground.width,
      height: this.ground.height,
      list: [],
    };

    const stack = [this.ground.tree];

    while (stack.length) {
      const object = stack.shift();
      hash[object.name] = object.controller.getSaveObject(object);
      data.list.push(hash[object.name]);
      stack.push(...object.children);

      const classes = object.class.split(/\s+/).filter(v => v);
      writeClasses(classes, object.name);
    }

    return data;
  }
}

module.exports = {Handler};
