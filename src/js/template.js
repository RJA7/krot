const stringifyObject = require('stringify-object');

const jsTemplate = (data) => `${krot.config.imports || ''}
import { populate } from 'krot-pixi';

const raw = ${krot.token}${stringifyObject(data)}${krot.token};

class Layout {
  constructor(filter) {
${data.list.filter(item => item.name).map(item => `    this.${item.name} = null;`).join('\n')}

    populate(this, raw, filter);
  }
}

module.exports = { Layout, raw };
`;

const tsTemplate = (data) => `/* tslint:disable */
${krot.config.imports || ''}
import { populate } from 'krot-pixi';

const raw = ${krot.token}${stringifyObject(data)}${krot.token};

type Filter = Partial<{
${data.list.filter(item => item.name).map(item => `  ${item.name}: boolean;`).join('\n')}
}>;

class Layout {
${data.list.filter(item => item.name).map(item => `  public readonly ${item.name}: PIXI.${item.type};`).join('\n')}

  constructor(filter?: Filter) {
    populate(this, raw, filter);
  }
}

export { Layout, Filter, raw };
`;

module.exports = {jsTemplate, tsTemplate};
