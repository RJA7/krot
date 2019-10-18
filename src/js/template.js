const stringifyObject = require('stringify-object');

const jsTemplate = ({data, fields}) => `${app.filePrefix || ''}const { populate } = require('krot-pixi');

const raw = ${krot.token}${stringifyObject(data)}${krot.token};

class Layout {
  constructor(filter) {
${fields.map(name => `    this.${name} = null;`).join('\n')}

    populate(this, raw, filter);
  }
}

module.exports = { Layout, raw };
`;

const tsTemplate = ({data, fields, hash}) => `${app.filePrefix || ''}const { populate } = require('krot-pixi');

const raw = ${krot.token}${stringifyObject(data)}${krot.token};

type Filter = Partial<{
${fields.map(name => `  ${name}: boolean;`).join('\n')}
}>;

class Layout {
${fields.map(name => `  public readonly ${name}: ${app.typePrefix || ''}${hash[name].constructor.name};`).join('\n')}

  constructor(filter?: Filter) {
    populate(this, raw, filter);
  }
}

export { Layout, Filter, raw };
`;

module.exports = {jsTemplate, tsTemplate};
