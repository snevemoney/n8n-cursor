const fs=require('node:fs'),path=require('node:path'),yaml=require('js-yaml'),Ajv=require('ajv'),addFormats=require('ajv-formats');
try {
 const source=process.argv[2]||path.resolve(__dirname,'../../../contracts/telemetry.yaml');
 const doc=yaml.load(fs.readFileSync(source,'utf8'));
 const strings={type:'array',uniqueItems:true,items:{type:'string',minLength:1}};
 const fields={type:'object',required:['required','optional'],properties:{required:strings,optional:strings}};
 const rate={type:'number',minimum:0,maximum:1};
 const schema={type:'object',required:['spans','metrics','sampling','export','logging','resource'],properties:{
  spans:{type:'object',minProperties:1,additionalProperties:{type:'object',required:['description','attributes'],properties:{description:{type:'string'},attributes:fields}}},
  metrics:{type:'object',minProperties:1,additionalProperties:{type:'object',required:['type','description','labels'],properties:{type:{enum:['counter','gauge','histogram']},description:{type:'string'},labels:strings,buckets:{type:'array',minItems:1,items:{type:'number',minimum:0}}},allOf:[{if:{properties:{type:{const:'histogram'}}},then:{required:['buckets']}}]}},
  sampling:{type:'object',required:['traces'],properties:{traces:{type:'object',required:['default','rules'],properties:{default:rate,rules:{type:'array',items:{type:'object',required:['service','operation','rate'],properties:{service:{type:'string',minLength:1},operation:{type:'string',minLength:1},rate}}}}}}},
  export:{type:'object',required:['traces','metrics','logs'],additionalProperties:{type:'object',required:['endpoint','batch_size','export_timeout'],properties:{endpoint:{type:'string',format:'uri'},batch_size:{type:'integer',minimum:1},export_timeout:{type:'integer',minimum:1}}}},
  logging:{type:'object',required:['format','level','fields','levels'],properties:{format:{type:'string'},level:{type:'string'},fields,levels:{type:'object',minProperties:1,additionalProperties:{type:'integer'}}}},resource:{type:'object'}
 }};
 const ajv=addFormats(new Ajv({allErrors:true,strict:false}));
 if(!ajv.validate(schema,doc))throw new Error(ajv.errorsText());
 for(const [name,metric] of Object.entries(doc.metrics))if(metric.buckets?.some((v,i,a)=>i>0&&v<=a[i-1]))throw new Error(name+': histogram buckets must strictly increase');
 for(const rule of doc.sampling.traces.rules)if(!Object.hasOwn(doc.spans,rule.operation))throw new Error('Unknown sampling operation: '+rule.operation);
 if(!Object.hasOwn(doc.logging.levels,doc.logging.level))throw new Error('Unknown logging level');
 console.log('Telemetry fields, metrics, sampling references and exporter settings are valid.');
} catch(error){console.error('Invalid telemetry: '+error.message);process.exitCode=1;}
