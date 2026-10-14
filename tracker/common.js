import {config} from './config.js';
export const stages = ['waiting','up_next','production','wrapping','completed'];
export const labels = ['Waiting','Up next','Being made','Wrapping up','Completed'];
export const messages = [
  'Your rug is waiting to begin production.',
  'Your rug is up next in the production queue.',
  'Your design has been drawn onto the backing and your rug is being made.',
  'Please have final payment ready at completion.',
  'Your rug is complete. Contact NonFandomDesigns for pickup or delivery details.'
];
export function el(tag, text, cls) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}
export async function api(path, body, token) {
  const response = await fetch(config.url + path, {
    method:'POST', cache:'no-store', referrerPolicy:'no-referrer',
    headers:{'Content-Type':'application/json', apikey:config.publishableKey,
      ...(token ? {Authorization:'Bearer '+token} : {})},
    body:JSON.stringify(body), signal:AbortSignal.timeout(15000)
  });
  const data = await response.json().catch(()=>null);
  if (!response.ok) {
    if (data?.message === 'Invalid tracker access code') throw new Error('That access code was not accepted. Please check the code you received.');
    if (response.status===401 || response.status===403) throw new Error('Access was not accepted. Check your sign-in details or ask the site owner for access.');
    throw new Error('The tracker is temporarily unavailable. Please try again later or contact NonFandomDesigns.');
  }
  if(data?.error) throw new Error(data.error);
  return data;
}
export function card(order) {
  const node=el('details',undefined,'order');
  const summary=el('summary');
  summary.append(el('span',order.name,'rug-name'),el('span',labels[stages.indexOf(order.stage)],'badge'));
  node.append(summary);
  const body=el('div',undefined,'order-body');
  body.append(el('p',order.description || 'Handmade custom rug.','description'),el('p','Phone ending ••'+order.phone_last_two,'muted'));
  const list=el('ol',undefined,'stages');
  const current=stages.indexOf(order.stage);
  labels.forEach((label,i)=>{
    const item=el('li',label,i===current?'current':i<current?'passed':'');
    if(i===current)item.setAttribute('aria-current','step');
    list.append(item);
  });
  body.append(list,el('p',messages[current],'stage-message'));
  if(['waiting','up_next'].includes(order.stage)) body.append(el('p',`${order.ahead} ${order.ahead===1?'order':'orders'} ahead of this rug.`,'queue-count'));
  node.append(body);
  return node;
}
