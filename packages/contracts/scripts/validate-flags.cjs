const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const source = process.argv[2] || path.resolve(__dirname, '../../../contracts/flags.schema.json');
try {
  const schema = JSON.parse(fs.readFileSync(source, 'utf8'));
  const ajv = addFormats(new Ajv({ allErrors: true, strict: false }));
  if (!ajv.validateSchema(schema)) throw new Error(ajv.errorsText());
  ajv.compile(schema); // Also reject unresolved references.
  console.log('Flags schema is valid and compilable.');
} catch (error) {
  console.error('Invalid flags schema: ' + error.message);
  process.exitCode = 1;
}
