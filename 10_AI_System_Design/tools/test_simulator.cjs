const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const stage=path.resolve(process.argv[2]),ui=JSON.parse(fs.readFileSync(path.join(stage,'lesson-ui.json'))),simulate=require(path.join(stage,'labs/simulator.js'));
for(const test of ui.cases)assert.deepEqual(simulate(test.params),test.expected,test.name);
console.log(`PASS: Stage ${ui.stage}, ${ui.cases.length} deterministic JavaScript cases.`);
