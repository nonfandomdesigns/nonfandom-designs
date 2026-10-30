/* Official character profiles are the source of these affinities. No answer is exclusive to one character. */
export const characters = [
 ['sakurama','Sakurama','The Heart','You protect through love, even when caring asks something difficult of you. Your strength holds both courage and emotional depth.','Let others care for you, too.'],
 ['kurogi','Kurogi','The Vanguard','You take responsibility when others hesitate. Independent and determined, you show your devotion through action and protective strength.','Leadership can make room for tenderness.'],
 ['aoma','Aoma','The Architect','You notice patterns, anticipate consequences, and wait for the smartest opening. Your patience turns uncertainty into a considered plan.','A useful plan also leaves room for surprise.'],
 ['ika','Ika','The Trickster','You bring wit, invention, and playful rebellion wherever you go. You see an ordinary moment as an invitation to make something unexpected happen.','Notice when someone needs steadiness alongside the fun.'],
 ['iko','Iko','The Puppeteer','You read people carefully and shape events through timing and persuasion. You prefer a subtle, deliberate move to announcing every intention.','Influence is strongest when it leaves others room to choose.'],
 ['sakuyo','Sakuyo','The Vessel','You adapt, endure, and remain loyal, even while weighing what others ask against what you want for yourself. That tension is part of your resilience.','Your own wishes deserve a voice beside your commitments.'],
 ['kurogumo','Kurogumo Ryū','The Guardian','You meet danger with courage when someone depends on you. Honor and unwavering devotion turn your strength toward protecting those you love or serve.','Protecting others can include accepting their help.'],
 ['saku','Saku','The Familiar','You see the potential in others and find thoughtful, resourceful ways to help it grow. Your quiet encouragement makes people stronger.','Give your own potential that same attention.'],
 ['tenzaru','Tenzaru','The Sage','You seek understanding before confrontation. Compassion, reflection, and inner calm help you respond thoughtfully when the world becomes loud.','Peace can include stating a difficult truth.'],
 ['torai','Torai','The Fool','You make room for humor, freedom, and being unapologetically yourself. Your unconventional spirit reminds others that life need not always be so serious.','Freedom and follow-through can coexist.'],
 ['shikayomi','Shikayomi','The Enchantress','You carry a quiet, magnetic confidence. Independent and protective, you can hold a boundary with presence and conviction rather than force.','Being understood sometimes means letting someone see past the mystery.'],
 ['ankyu','Ankyu','The Sentinel','You keep showing up for what matters. Discipline, patience, and dependable commitment help you honor responsibilities through difficult stretches.','Rest helps sustain the commitments you value.'],
 ['fury','Koji & Kiri','The Fury','You feel deeply and act with fearless intensity. You trust instinct and express your emotions openly, bringing your whole self into the moment.','A pause can give your passion a clearer direction.'],
 ['kinhoshi','Kinhoshi','The Predator','You study the details and wait for the right moment to execute. Focus, observation, and discipline make precision your particular strength.','Excellence need not demand perfection every time.'],
 ['jorobana','Jorobana','The Overlord','You think in terms of the whole situation. Independent and purposeful, you establish direction and delegate strategically rather than handling every task yourself.','Good delegation also listens to the people carrying it out.']
].map(([id,name,title,meaning,growth])=>({id,name,title,meaning,growth}));
const q=(type,text,rows)=>({type,text,answers:rows.map(([text,p,s,t,evidence])=>({text,weights:{[p]:4,[s]:2,[t]:1},evidence}))});
export const questions=[
 q('Yomizakura','A blight reaches the Devil Tree. What is your first instinct?',[
 ['Shield the vulnerable blossoms, even if the blight reaches me.','sakurama','kurogumo','saku','putting yourself between danger and someone vulnerable'],
 ['Take the front line and give everyone a clear direction.','kurogi','kurogumo','ankyu','taking charge when protection calls for action'],
 ['Watch how the blight spreads before choosing where to intervene.','aoma','kinhoshi','tenzaru','observing a pattern before making a move'],
 ['Try an unexpected distraction to draw it away from the roots.','ika','torai','sakuyo','improvising an unexpected way through danger']]),
 q('Everyday life','A group project has stalled. What feels most natural?',[
 ['Talk to people individually and quietly build agreement.','iko','shikayomi','aoma','building agreement through carefully timed conversations'],
 ['Take on the role the group needs, while wondering if it suits me.','sakuyo','ankyu','saku','adapting to expectations while noticing your own needs'],
 ['Stand beside the teammate taking the most pressure.','kurogumo','sakurama','kurogi','standing by someone under pressure'],
 ['Help each person find a task they can feel confident doing.','saku','tenzaru','sakuyo','helping people discover what they can contribute']]),
 q('Yomizakura','You find an unfamiliar shrine beyond Mount Yoshino. What draws you in?',[
 ['The chance to sit quietly and understand its history.','tenzaru','aoma','saku','seeking calm and understanding in an unfamiliar place'],
 ['The strange path that nobody seems to have tried.','torai','ika','shikayomi','choosing an unconventional path for yourself'],
 ['The mysterious presence within; I would approach on my own terms.','shikayomi','kurogi','jorobana','approaching mystery with independent confidence'],
 ['The promise I made to keep watch here until dawn.','ankyu','kurogumo','sakuyo','keeping a commitment even without an audience']]),
 q('Everyday life','You finally have a free evening. What sounds most satisfying?',[
 ['Throw myself into whatever I feel most strongly about tonight.','fury','ika','kurogi','following the intensity of what you feel in the moment'],
 ['Refine a skill until a difficult detail finally clicks.','kinhoshi','ankyu','aoma','finding satisfaction in precise, practiced execution'],
 ['Set a shared plan in motion, with everyone handling their specialty.','jorobana','iko','kurogi','setting direction and trusting others with distinct roles'],
 ['Make time for someone who has had a hard week.','sakurama','saku','tenzaru','choosing care and emotional connection']]),
 q('Deeper values','When two good commitments conflict, what guides you most?',[
 ['Choose a direction I can stand behind and own the consequences.','kurogi','shikayomi','jorobana','owning a difficult decision with conviction'],
 ['Consider the longer chain of consequences before deciding.','aoma','tenzaru','kinhoshi','weighing consequences beyond the immediate moment'],
 ['Find a creative third option that changes the terms.','ika','torai','saku','challenging the terms with a creative alternative'],
 ['Understand what each person needs, then guide a compromise.','iko','aoma','shikayomi','shaping a compromise through insight into people']]),
 q('Yomizakura','A trusted leader gives you a difficult mission. How do you respond?',[
 ['Accept, but work out where the mission leaves room for my own choices.','sakuyo','shikayomi','ankyu','balancing loyalty with a need for personal choice'],
 ['Go without hesitation if someone I serve needs protection.','kurogumo','kurogi','sakurama','answering a call to protect without hesitation'],
 ['Offer practical support that makes the whole team more capable.','saku','sakurama','sakuyo','strengthening the people carrying out a difficult task'],
 ['Ask what understanding might resolve the conflict before it grows.','tenzaru','aoma','saku','looking for understanding before confrontation']]),
 q('Everyday life','Friends change the plans at the last minute. You tend to…',[
 ['Enjoy the detour and make the evening my own.','torai','ika','sakuyo','welcoming a detour without giving up your individuality'],
 ['Choose what suits me and invite others along with confidence.','shikayomi','kurogi','torai','staying confident in your own preferences'],
 ['Make sure the arrangements people rely on are still covered.','ankyu','saku','kurogumo','preserving the commitments others depend on'],
 ['Say exactly how I feel and jump into what excites me.','fury','ika','torai','expressing your feelings openly and acting on excitement']]),
 q('Yomizakura','Your party must cross a dangerous pass. What role do you choose?',[
 ['Study the footing and make each movement count.','kinhoshi','aoma','ankyu','studying details to execute a difficult passage precisely'],
 ['Assign scouts, supplies, and protection while coordinating the crossing.','jorobana','kurogi','iko','coordinating a larger effort through delegation'],
 ['Stay with whoever is struggling, even if it slows my crossing.','sakurama','saku','kurogumo','accepting a personal cost to care for someone'],
 ['Lead the way and tackle the obstacles ahead of the group.','kurogi','kurogumo','fury','leading from the front through protective action']]),
 q('Deeper values','What kind of achievement feels most like yours?',[
 ['Seeing a possibility early and bringing a thoughtful plan to life.','aoma','jorobana','kinhoshi','valuing foresight and a thoughtfully realized plan'],
 ['Inventing a surprising approach nobody expected.','ika','torai','saku','valuing invention and playful surprise'],
 ['Moving a difficult situation through insight and persuasion.','iko','jorobana','shikayomi','valuing deliberate influence and persuasion'],
 ['Remaining loyal while finding a voice that is still my own.','sakuyo','ankyu','shikayomi','valuing both belonging and personal agency']]),
 q('Everyday life','Someone close to you faces a daunting challenge. How do you help?',[
 ['Promise I will stand with them, whatever they face.','kurogumo','sakurama','ankyu','offering unwavering protection and companionship'],
 ['Notice their strengths and help them take a manageable next step.','saku','tenzaru','sakuyo','helping someone recognize and use their strengths'],
 ['Listen patiently and help them see the situation more clearly.','tenzaru','saku','aoma','offering patience, perspective, and calm'],
 ['Bring some humor and remind them they can choose their own path.','torai','ika','shikayomi','using humor to make room for freedom']]),
 q('Yomizakura','At a gathering beneath the blossoms, tension rises. What do you do?',[
 ['Hold my ground calmly; my boundaries will be clear.','shikayomi','kurogi','iko','holding a boundary with quiet confidence'],
 ['Keep my post so the gathering remains safe while others talk.','ankyu','kurogumo','sakuyo','remaining dependable while a situation grows difficult'],
 ['Address the tension directly with all the feeling it deserves.','fury','kurogi','sakurama','meeting tension with honest emotional intensity'],
 ['Notice the exact trigger and intervene at the right moment.','kinhoshi','aoma','iko','observing closely and choosing a precise intervention']]),
 q('Everyday life','A large celebration needs organizing. Where do you fit best?',[
 ['Give it a clear direction and ask the right people to lead each part.','jorobana','kurogi','aoma','directing a shared effort through purposeful delegation'],
 ['Make sure people feel welcomed and cared for.','sakurama','saku','tenzaru','placing care at the center of a shared experience'],
 ['Take ownership of the toughest job and get it moving.','kurogi','ankyu','fury','taking responsibility and driving action'],
 ['Anticipate what could go wrong and design a workable plan.','aoma','kinhoshi','jorobana','anticipating obstacles before they arrive']]),
 q('Yomizakura','An enchanted gate responds differently to every traveler. How would you try it?',[
 ['Play with its rules and see if a clever surprise opens it.','ika','torai','aoma','testing possibilities through playful improvisation'],
 ['Read its guardian carefully and persuade them to let us pass.','iko','shikayomi','jorobana','using insight and persuasion to open a path'],
 ['Adjust to what it asks, while deciding how much of myself to give.','sakuyo','ankyu','shikayomi','adapting while considering the cost to your independence'],
 ['Face its trial without hesitation to secure passage for my companions.','kurogumo','kurogi','sakurama','facing a trial out of unwavering devotion']]),
 q('Everyday life','When you join a new community, what do you naturally bring?',[
 ['Encouragement and practical help so others feel capable.','saku','sakurama','sakuyo','empowering others through thoughtful support'],
 ['A calm presence and a willingness to understand different views.','tenzaru','aoma','saku','bringing patience and understanding to others'],
 ['My own unusual perspective, without trying too hard to fit in.','torai','ika','shikayomi','embracing individuality without needing permission'],
 ['Quiet confidence and firm loyalty to the people I connect with.','shikayomi','kurogi','kurogumo','combining independent confidence with protective loyalty']]),
 q('Deeper values','Which promise to yourself matters most when life becomes difficult?',[
 ['I will keep showing up for the responsibilities I chose.','ankyu','sakuyo','kurogumo','choosing steadfast commitment through difficulty'],
 ['I will not hide the depth of what I feel or want.','fury','sakurama','torai','choosing emotional honesty and intensity'],
 ['I will practice until my actions meet the standard I believe in.','kinhoshi','ankyu','aoma','choosing disciplined mastery and accurate execution'],
 ['I will keep sight of the whole picture and direct my energy with purpose.','jorobana','aoma','iko','choosing purposeful direction and the larger picture']])
];
/* Standardize each character against the same independent, equally likely answer baseline.
   This corrects unequal secondary exposure without favoring a character by array order. */
export function stats(subset=questions){return characters.map(c=>{
 let mean=0,variance=0;
 for(const q of subset){const v=q.answers.map(a=>a.weights[c.id]||0),m=v.reduce((a,b)=>a+b,0)/4;mean+=m;variance+=v.reduce((a,b)=>a+(b-m)**2,0)/4;}
 return {mean,sd:Math.sqrt(variance)||1};
});}
export const baseline=stats();
export function rank(answers, indices=questions.map((_,i)=>i)){
 const base=stats(indices.map(i=>questions[i]));
 return characters.map((c,k)=>{
 let raw=0,evidence=[];
 indices.forEach(i=>{const a=questions[i].answers[answers[i]],w=a.weights[c.id]||0;raw+=w;if(w)evidence.push({weight:w,text:a.evidence,question:i});});
 const score=(raw-base[k].mean)/base[k].sd;
 evidence.sort((a,b)=>b.weight-a.weight||a.question-b.question);
 return {...c,raw,score,evidence};
 }).sort((a,b)=> b.score-a.score || b.evidence.filter(e=>e.weight===4).length-a.evidence.filter(e=>e.weight===4).length || tieKey(a.id,answers)-tieKey(b.id,answers));
}
function tieKey(id,answers){let h=2166136261;for(const c of id+answers.join(''))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function results(answers){
 if(answers.length!==15||answers.some(a=>!Number.isInteger(a)||a<0||a>3))throw Error('Complete all 15 questions first.');
 const ordered=rank(answers), first=ordered[0],second=ordered[1];
 const values=rank(answers,[4,8,14]);
 const hidden=values.find(c=>c.id!==first.id&&c.id!==second.id);
 return [first,second,hidden];
}
