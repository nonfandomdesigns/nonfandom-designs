import {api,el,stages,labels} from './common.js';
const $=id=>document.getElementById(id);
let token='', rows=[];let busy=false;
function selectOptions(select,value='waiting'){stages.forEach((stage,i)=>{const option=el('option',labels[i]);option.value=stage;select.append(option);});select.value=value;}
selectOptions(document.querySelector('#create select'));
async function rpc(name,body={}){return api('/rest/v1/rpc/nfd_tracker_'+name,body,token);}
async function action(fn){
 if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);
 $('status').textContent='Working…';
 try{await fn();$('status').textContent='Saved.';}catch(e){$('status').textContent=e.message;}
 finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=b.dataset.unavailable==='true');}
}
function fields(form){const data=Object.fromEntries(new FormData(form));return {name:data.name.trim(),description:data.description.trim(),phone_last_two:data.phone_last_two,stage:data.stage};}
async function load(){rows=await rpc('admin_list');render();}
function render(){
 $('orders').replaceChildren();
 rows.forEach((row,index)=>{
  const container=el('section',undefined,'panel');container.append(el('h2',row.name));
  const form=el('form');
  for(const [key,label,max] of [['name','Rug name',100],['description','Short description',300],['phone_last_two','Last two phone digits',2]]){
   const wrapper=el('label',label);const input=el(key==='description'?'textarea':'input');input.name=key;input.value=row[key];input.maxLength=max;
   if(key!=='description')input.required=true;
   if(key==='phone_last_two'){input.pattern='[0-9]{2}';input.inputMode='numeric';}
   wrapper.append(input);form.append(wrapper);
  }
  const label=el('label','Stage');const select=el('select');select.name='stage';selectOptions(select,row.stage);label.append(select);form.append(label);
  const actions=el('div',undefined,'actions');const save=el('button','Save changes');save.type='submit';actions.append(save);
  for(const [text,offset] of [['Move up',-1],['Move down',1]]){
   const button=el('button',text,'secondary');button.type='button';button.disabled=index+offset<0||index+offset>=rows.length;button.dataset.unavailable=String(button.disabled);
   button.onclick=()=>action(async()=>{const ids=rows.map(r=>r.id);const other=index+offset;if(other<0||other>=ids.length)return;[ids[index],ids[other]]=[ids[other],ids[index]];await rpc('reorder',{order_ids:ids});await load();});actions.append(button);
  }
  form.append(actions);form.onsubmit=event=>{event.preventDefault();action(async()=>{await rpc('save',{order_id:row.id,order_data:fields(form)});await load();});};container.append(form);$('orders').append(container);
 });
 if(!rows.length)$('orders').append(el('p','No orders yet. Create an order or import your private file.','panel'));
}
$('sign-in').onsubmit=event=>{event.preventDefault();action(async()=>{
 const data=await api('/auth/v1/token?grant_type=password',{email:$('email').value,password:$('password').value});
 token=data.access_token;$('password').value='';
 try{await load();$('login').hidden=true;$('desk').hidden=false;}catch(e){token='';throw e;}
});};
$('create').onsubmit=event=>{event.preventDefault();action(async()=>{await rpc('save',{order_id:null,order_data:fields(event.target)});event.target.reset();await load();});};
$('reload').onclick=()=>action(load);
$('set-code').onclick=()=>action(async()=>{
 const code=$('chosen-code').value.trim();
 if(code.length<10||code.length>128)throw new Error('Use a code with 10–128 characters.');
 if(!confirm('Save this shared code and disable the previous one?'))return;
 await rpc('set_code',{access_code:code});$('chosen-code').value='';$('shared-code').textContent='Shared access code saved. Share it privately with your customers.';
});
$('rotate').onclick=()=>action(async()=>{
 if(!confirm('Replace the shared access code? Customers using the old code will need the new one.'))return;
 const code=await rpc('rotate');$('shared-code').textContent='Copy and privately share this code: '+code;
});
$('logout').onclick=async()=>{const old=token;token='';rows=[];$('orders').replaceChildren();$('shared-code').textContent='';$('chosen-code').value='';$('desk').hidden=true;$('login').hidden=false;$('status').textContent='Signed out.';await api('/auth/v1/logout',{},old).catch(()=>{});};
$('import-button').onclick=()=>action(async()=>{
 const file=$('import').files[0];if(!file)throw new Error('Select your private order file first.');
 if(file.size>100000)throw new Error('Order file is too large.');
 const data=JSON.parse(await file.text());
 if(!Array.isArray(data)||!data.length||data.length>100)throw new Error('Expected 1–100 orders.');
 await rpc('import',{order_data:data});$('import').value='';await load();
});
