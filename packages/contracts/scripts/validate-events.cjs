const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
try {
  const source = process.argv[2] || path.resolve(__dirname, '../../../contracts/events.yaml');
  const schema = yaml.load(fs.readFileSync(source, 'utf8'));
  if (!schema || !schema.definitions || !Object.keys(schema.definitions).length) throw new Error('Event definitions are missing');
  const ajv = addFormats(new Ajv({allErrors:true, strict:false}));
  if (!ajv.validateSchema(schema)) throw new Error(ajv.errorsText());
  for (const name of Object.keys(schema.definitions)) {
    const pointer = name.replace(/~/g, '~0').replace(/\//g, '~1');
    ajv.compile({definitions:schema.definitions, $ref:'#/definitions/' + pointer});
  }
  console.log('All event definitions are valid and compilable.');
} catch (error) {
  console.error('Invalid event schema: ' + error.message);
  process.exitCode = 1;
}
