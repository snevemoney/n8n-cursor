const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
try {
  const source = process.argv[2] || path.resolve(__dirname, '../../../contracts/errors.yaml');
  const catalog = yaml.load(fs.readFileSync(source, 'utf8'));
  const ajv = addFormats(new Ajv({allErrors:true, strict:false}));
  const shape = {type:'object', required:['errors','categories','httpStatusCodes','errorResponseFormat'], properties:{
    errors:{type:'object',minProperties:1,propertyNames:{pattern:'^LFAI-[0-9]{4}$'},additionalProperties:{type:'object',required:['http','message','description','category','retryable'],properties:{http:{type:'integer',minimum:400,maximum:599},message:{type:'string',minLength:1},description:{type:'string'},category:{type:'string',minLength:1},retryable:{type:'boolean'}}}},
    categories:{type:'object',minProperties:1,additionalProperties:{type:'string'}},
    httpStatusCodes:{type:'object',minProperties:1,additionalProperties:{type:'string'}},
    errorResponseFormat:{type:'object'}
  }};
  if (!ajv.validate(shape,catalog)) throw new Error(ajv.errorsText());
  for (const [code,error] of Object.entries(catalog.errors)) {
    if (!Object.hasOwn(catalog.categories,error.category)) throw new Error(code + ': unknown category');
    if (!Object.hasOwn(catalog.httpStatusCodes,error.http)) throw new Error(code + ': undocumented HTTP status');
  }
  if (!ajv.validateSchema(catalog.errorResponseFormat)) throw new Error(ajv.errorsText());
  ajv.compile(catalog.errorResponseFormat);
  console.log('Error catalog entries, references and response schema are valid.');
} catch (error) {
  console.error('Invalid error catalog: ' + error.message);
  process.exitCode = 1;
}
