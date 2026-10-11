const path = require('node:path');
const fs = require('node:fs');
const yaml = require('js-yaml');
const Parser = require('swagger-parser');
const source = process.argv[2] || path.resolve(__dirname, '../../../contracts/openapi.yaml');
Promise.resolve().then(() => yaml.load(fs.readFileSync(source, "utf8")))
  .then(document => Parser.validate(document, {resolve:{http:false,file:false}}))
  .then(() => console.log('OpenAPI document and internal references are valid.'))
  .catch(error => { console.error('Invalid OpenAPI: ' + error.message); process.exitCode=1; });
