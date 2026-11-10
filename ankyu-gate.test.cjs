const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = __dirname;

(async () => {
  const listeners = {};
  const listing = {hidden:true,querySelectorAll:()=>[]};
  let clock = Date.parse('2026-12-01T00:00:00Z');
  let scheduled;
  class TestDate extends Date { static now() { return clock; } }
  const window = {
    matchMedia:()=>({matches:false,addEventListener(){}}),
    addEventListener:(event,callback)=>{listeners[event]=callback;}
  };
  const context = vm.createContext({window,Date:TestDate,console,
    document:{querySelector:s=>s==='#tessumo-listing'?listing:null,addEventListener(){}},
    setTimeout:(callback,delay)=>{scheduled={callback,delay};return 1;},clearTimeout(){},
    fetch:async()=>{throw Error('Offline test');},AbortSignal
  });
  vm.runInContext(fs.readFileSync(path.join(root,'ankyu-gate-config.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'ankyu-gate.js'),'utf8'),context);
  await Promise.resolve(); await Promise.resolve();
  const config=window.ANKYU_REVEAL;
  assert.equal(config.timeZone,'America/New_York');
  assert.equal(Date.parse(config.end),Date.parse('2026-11-27T05:00:00Z'));
  for(const [instant,permanent] of [
    ['2026-11-09T23:59:59.999-05:00',false],
    ['2026-11-10T00:00:00-05:00',false],
    ['2026-11-26T23:59:59.999-05:00',false],
    ['2026-11-27T00:00:00-05:00',true],
    ['2027-11-10T00:00:00-05:00',true]
  ]) {
    clock=Date.parse(instant); listeners.pageshow();
    assert.equal(!listing.hidden,permanent,instant);
  }
  clock=Date.parse(config.end)-1; listeners.pageshow();
  assert.equal(scheduled.delay,1,'Open tabs schedule the exact closing boundary');
  clock++; scheduled.callback();
  assert.equal(listing.hidden,false,'Open tabs transition without reloading');
  console.log('PASS: Eastern start/end, Thanksgiving final millisecond, permanent listing, no annual repeat, resumed tabs, exact cutoff timer.');
})().catch(error=>{console.error(error);process.exitCode=1;});
