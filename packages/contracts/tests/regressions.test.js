const {execFileSync}=require('node:child_process');
const path=require('node:path');
// Each script exercises its actual TypeScript source and owns failure assertions.
// Subprocess isolation prevents shared Ajv/global configuration leaking between cases.
test.each(['errors','exports','validation','events','schema','objects','flags','time','event-schema','flag-schema','event-document','error-document','error-code-gate','telemetry-document','openapi-document','error-parity','telemetry-parity'])('%s contract regression',name=>{
  const output=execFileSync(process.execPath,[path.join(__dirname,name+'.cjs')],{
    cwd:path.resolve(__dirname,'..'),encoding:'utf8',timeout:15000,
    env:{...process.env,TZ:'America/Toronto'}
  });
  expect(output.trim().length).toBeGreaterThan(0);
});
