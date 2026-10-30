import {characters,questions,results} from './data.js';
const $=id=>document.getElementById(id), views=['intro','quiz','ritual','reading'], key='yomizakura-reading-v1';
let answers=[],current=0,reading=[],revealed=new Set(),busy=false,shared=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const save=()=>{try{localStorage.setItem(key,JSON.stringify({answers,current}));}catch{}};
function show(id){for(const v of views)$(v).hidden=v!==id;}
function scrollTop(){window.scrollTo({top:0,behavior:'instant'});}
function renderQuestion(){
 show('quiz');const q=questions[current];$('chapter').textContent=q.type;$('count').textContent=`${current+1} / 15`;$('progress-fill').style.width=`${current/15*100}%`;
 document.querySelector('.progress').setAttribute('aria-valuenow',String(current));$('question').textContent=q.text;const field=$('answers');field.replaceChildren(Object.assign(document.createElement('legend'),{className:'sr-only',textContent:'Choose one answer'}));
 q.answers.forEach((a,i)=>{const label=document.createElement('label');label.className='answer';const radio=Object.assign(document.createElement('input'),{type:'radio',name:'answer',value:String(i),checked:answers[current]===i});
 const letter=Object.assign(document.createElement('span'),{className:'answer-letter',textContent:'ABCD'[i]});letter.setAttribute('aria-hidden','true');
 label.append(radio,letter,Object.assign(document.createElement('span'),{textContent:a.text}));field.append(label);
 radio.addEventListener('change',()=>{answers[current]=i;save();$('next').disabled=false;$('selection-hint').textContent='Answer selected. Continue when ready.';});});
 $('back').disabled=current===0;$('next').disabled=answers[current]===undefined;$('next').textContent=current===14?'Reveal my reading ✧':'Continue →';$('selection-hint').textContent=answers[current]===undefined?'Choose an answer to continue.':'Answer selected. Continue when ready.';
 save();scrollTop();$('question').focus();
}
$('start').onclick=()=>{answers=[];current=0;renderQuestion();};
$('resume').onclick=()=>{try{const s=JSON.parse(localStorage.getItem(key));answers=s.answers;current=s.current;}catch{answers=[];current=0;}renderQuestion();};
$('back').onclick=()=>{if(current>0){current--;renderQuestion();}};
$('next').onclick=()=>{if(answers[current]===undefined||busy)return;if(current<14){current++;renderQuestion();}else finish();};
function petals(){if(reduced)return;const rect=$('question-panel').getBoundingClientRect();for(let i=0;i<64;i++){const p=document.createElement('i');p.className='petal';const x=rect.left+Math.random()*rect.width,y=Math.max(30,rect.top)+Math.random()*Math.min(rect.height,innerHeight*.65);p.style.cssText=`left:${x}px;top:${y}px;width:${7+Math.random()*11}px;height:${5+Math.random()*8}px;--duration:${1.6+Math.random()*1.8}s;--dx:${(Math.random()-.5)*innerWidth*.9}px;--dy:${-150-Math.random()*500}px;--spin:${Math.random()*720-360}deg;animation-delay:${Math.random()*.35}s`; $('petals').append(p);p.addEventListener('animationend',()=>p.remove(),{once:true});}}
async function finish(){busy=true;reading=results(answers);shared=false;$('next').disabled=true;petals();$('question-panel').classList.add('dissolving');await delay(reduced?0:1000);show('ritual');scrollTop();await delay(reduced?0:1600);$('question-panel').classList.remove('dissolving');renderReading();busy=false;try{localStorage.removeItem(key);}catch{}$('resume').hidden=true;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function cardBack(){const back=document.createElement('div');back.className='back-card card-face';back.innerHTML='<div class="back-inner"><span class="back-star" aria-hidden="true">✧</span><p class="back-word">YOMIZAKURA</p><img src="assets/devil-tree.png" alt=""><span class="back-divider" aria-hidden="true">❀ ─ ✧ ─ ❀</span><p class="back-caption">BENEATH THE BLOSSOMS</p></div>';return back;}
function renderReading(){
 show('reading');revealed=new Set();$('spread').replaceChildren();$('reading-actions').hidden=true;$('share-status').textContent='';$('reading-lede').textContent=shared?'A shared reflection from beneath the Devil Tree. Turn each card to discover the three spirits.':'The tree has chosen. Turn each card to meet your reflection.';
 reading.forEach((c,i)=>{const role=['True Match','Kindred Spirit','Hidden Nature'][i],slot=document.createElement('article');slot.className='result-slot'+(i===0?' true-match':'');const label=Object.assign(document.createElement('p'),{className:'role-label',textContent:i===0?'✧ Your True Match · Best Match':`0${i+1} · ${role}`});
 const btn=document.createElement('button');btn.className='card-flip';btn.setAttribute('aria-label',`Reveal your ${role}`);btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls',`result-${i}`);
 const rot=document.createElement('span');rot.className='card-rotator';const front=document.createElement('span');front.className='card-face front';front.setAttribute('aria-hidden','true');const img=Object.assign(document.createElement('img'),{src:`assets/${c.id}.png`,alt:`${c.name} — ${c.title}`});front.append(img);rot.append(cardBack(),front);btn.append(rot);
 const hint=Object.assign(document.createElement('p'),{className:'reveal-hint',textContent:'Tap to turn your card'}),copy=document.createElement('div');copy.className='result-copy';copy.id=`result-${i}`;copy.hidden=true;
 copy.append(Object.assign(document.createElement('h2'),{textContent:c.name}),Object.assign(document.createElement('p'),{className:'result-title',textContent:c.title}),Object.assign(document.createElement('p'),{textContent:c.meaning}));
 if(!shared){const evidence=c.evidence.slice(0,2).map(e=>e.text);const p=document.createElement('p');p.className='evidence';p.textContent=evidence.length?`${i===2?'In your deeper values answers':'In your choices'}, you leaned toward ${evidence.join(' and ')}.`:'This is a relative echo among your choices, rather than a strong direct alignment.';copy.append(p);}
 if(i===2)copy.append(Object.assign(document.createElement('p'),{textContent:'Hidden Nature reflects a value beneath your everyday responses; it need not be how you usually act.'}));
 copy.append(Object.assign(document.createElement('p'),{className:'growth',textContent:c.growth}));
 btn.onclick=()=>{if(revealed.has(i))return;revealed.add(i);rot.classList.add('flipped');front.removeAttribute('aria-hidden');rot.querySelector('.back-card').setAttribute('aria-hidden','true');copy.hidden=false;hint.textContent=`${role} revealed`;btn.setAttribute('aria-label',`${role}: ${c.name}, ${c.title}`);btn.setAttribute('aria-expanded','true');if(revealed.size===3){$('reading-actions').hidden=false;$('reading-lede').textContent=shared?'Three spirits in a shared Yomizakura reading. Begin your own to discover what echoes in you.':'Different strengths can live within the same person. These are three reflections of your choices.';}};
 slot.append(label,btn,hint,copy);$('spread').append(slot);});
 scrollTop();$('reading-title').focus();
}
$('restart').onclick=()=>{history.replaceState(null,'',location.pathname);shared=false;answers=[];current=0;show('intro');scrollTop();$('start').focus();};
$('share').onclick=async()=>{
 const url=new URL(location.href);url.search='';url.hash=`reading=${reading.map(c=>c.id).join(',')}`;const text=`My Yomizakura reading: ${reading.map((c,i)=>`${['True Match','Kindred Spirit','Hidden Nature'][i]} — ${c.name}, ${c.title}`).join('; ')}.`;
 try{if(navigator.share){await navigator.share({title:'My Yomizakura Reading',text,url:url.href});$('share-status').textContent='Reading shared.';}else if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(`${text}\n${url.href}`);$('share-status').textContent='Your reading and link were copied.';}else{ $('share-status').textContent=`Copy this reading link: ${url.href}`; }}catch(e){$('share-status').textContent=e.name==='AbortError'?'Sharing canceled. Your reading is still here.':'Sharing was unavailable. Try again or copy the page link.';}
};
try{const s=JSON.parse(localStorage.getItem(key));if(s&&Array.isArray(s.answers)&&s.answers.length<=15&&s.answers.every(a=>Number.isInteger(a)&&a>=0&&a<=3)&&Number.isInteger(s.current)&&s.current>=0&&s.current<15&&s.current<=s.answers.length)$('resume').hidden=false;}catch{}
function readSharedHash(){const m=location.hash.match(/^#reading=([a-z,]+)$/);if(m){const ids=m[1].split(',');if(ids.length===3&&new Set(ids).size===3&&ids.every(id=>characters.some(c=>c.id===id))){reading=ids.map(id=>characters.find(c=>c.id===id));shared=true;renderReading();}}}
window.addEventListener('hashchange',readSharedHash);readSharedHash();
