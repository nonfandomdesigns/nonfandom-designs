import {config} from './config.js';
import {api,card,el,stages,labels} from './common.js';
const $=id=>document.getElementById(id);
let code='', orders=[], stageFilter='all';
if(config.characterImage){
 const image=el('img');image.src=config.characterImage;image.alt='Yomizakura character';image.className='character-image';document.querySelector('h1').before(image);
}
function render(){
 const filtered=stageFilter==='all'?orders:orders.filter(o=>o.stage===stageFilter);
 $('orders').replaceChildren(...filtered.map(card));
 if(!filtered.length)$('orders').append(el('p','No rugs in this stage right now.','panel'));
 $('filters').replaceChildren();
 ['all',...stages].forEach(stage=>{
  const count=stage==='all'?orders.length:orders.filter(o=>o.stage===stage).length;
  const button=el('button',(stage==='all'?'All rugs':labels[stages.indexOf(stage)])+' ('+count+')','secondary');
  button.setAttribute('aria-pressed',String(stageFilter===stage));
  button.onclick=()=>{stageFilter=stage;render();};$('filters').append(button);
 });
}
async function load(){
 $('status').textContent='Checking rug progress…'; $('refresh').disabled=true;
 try{
  const data=await api('/rest/v1/rpc/nfd_tracker_read',{access_code:code});
  orders=data;render();
  $('updated').textContent='Checked '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  $('gate').hidden=true;$('results').hidden=false;$('status').textContent='';
 }catch(error){orders=[];$('orders').replaceChildren();$('filters').replaceChildren();$('results').hidden=true;$('gate').hidden=false;$('status').textContent=error.message;}
 finally{$('refresh').disabled=false;}
}
$('unlock').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;
 code=$('code').value.trim();$('code').value='';try{await load();}finally{button.disabled=false;}
});
$('refresh').onclick=load;
$('lock').onclick=()=>{code='';orders=[];$('orders').replaceChildren();$('filters').replaceChildren();$('results').hidden=true;$('gate').hidden=false;$('status').textContent='Tracker locked.';};
