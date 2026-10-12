const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={devicePixelRatio:1};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'orb.js'),'utf8'),{window});
const canvas={clientWidth:240,clientHeight:240,width:0,height:0};
const orb=Object.create(window.JarvisOrb.prototype);orb.canvas=canvas;
for(const density of [1,2,1,1.5,2]){
 window.devicePixelRatio=density;orb.resize();
 assert.equal(canvas.width,Math.round(240*density),`backing width at density ${density}`);
 assert.equal(canvas.height,Math.round(240*density));
}
console.log('same-size screen-density transitions passed');
