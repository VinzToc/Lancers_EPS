/* app-prof.js — version professeur de « Lancers EPS » (intégrée à Mes Apps EPS, identifiant d'application : "lancers") */
const APP_ID='lancers',KEY='lancers_bareme_v1';
const $=s=>document.querySelector(s),esc=LS.esc,cp=LANCERS.cp;
document.getElementById('ver').textContent=APP_VERSION;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button,.tab').forEach(x=>x.classList.remove('act'));b.classList.add('act');$('#'+b.dataset.t).classList.add('act');if(b.dataset.t==='t2')bilan()});

/* ───── Barèmes : défaut + personnalisation (localStorage, protégé par try/catch) ───── */
function charger(){const d=LANCERS.defaut();
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');
  if(s&&typeof s==='object'){for(const ep of LANCERS.EPREUVES)if(s[ep]&&s[ep].bareme&&s[ep].prevision){{const ref=JSON.stringify([d[ep].bareme,d[ep].prevision]);d[ep].bareme=s[ep].bareme;d[ep].prevision=s[ep].prevision;if(JSON.stringify([d[ep].bareme,d[ep].prevision])!==ref)d[ep].provisoire=false}}
   if(LANCERS.verifier(d).length)return LANCERS.defaut()}}catch(e){}
 return d}
let BAR=charger(),draft=cp(BAR);
const DEF=LANCERS.defaut();
const pure=(b,ep)=>JSON.stringify([b[ep].bareme,b[ep].prevision]);
const isCustom=ep=>pure(BAR,ep)!==pure(DEF,ep);
function sauver(){try{localStorage.setItem(KEY,JSON.stringify(BAR));return true}catch(e){return false}}

/* ───── Élèves (base partagée Mes Apps EPS) ───── */
let L=[],cur=null;
async function elevesRefresh(){
 try{L=(await EPS.all()).sort((a,b)=>(a.nom+a.prenom).localeCompare(b.nom+b.prenom,'fr'))}catch(e){L=[]}
 const cl=[...new Set(L.map(e=>e.classe))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'fr',{numeric:true}));
 const sel=$('#fc').value;
 for(const id of['#fc','#bc'])$(id).innerHTML='<option value="">Toutes les classes</option>'+cl.map(c=>`<option ${c===sel&&id==='#fc'?'selected':''}>${esc(c)}</option>`).join('');
 listeEleves();
 $('#eInfo').textContent=L.length?`${L.length} élèves dans Mes Apps EPS.`:'Aucune liste d’élèves sur cet appareil : charge le fichier .xlsx (ou le .csv Pronote), ou ouvre d’abord le portail Mes Apps EPS dans ce navigateur.';
}
function listeEleves(){const c=$('#fc').value,keep=$('#fe').value;
 const r=L.filter(e=>!c||e.classe===c);
 $('#fe').innerHTML='<option value="">— Choisir —</option>'+r.map(e=>`<option value="${esc(e.id)}" ${e.id===keep?'selected':''}>${esc(e.nom.toUpperCase())} ${esc(e.prenom)}${c?'':' ('+esc(e.classe)+')'}</option>`).join('');
 cur=L.find(e=>e.id===$('#fe').value)||null}
$('#fc').onchange=()=>{$('#fe').value='';listeEleves()};
$('#fe').onchange=()=>{cur=L.find(e=>e.id===$('#fe').value)||null;$('#eMsg').textContent=''};
async function importer(f,msgEl){const m=$(msgEl);try{const r=await EPS.importFile(f);m.className='rgpd ok';m.style.fontWeight='700';
  m.textContent=`✅ ${r.add} ajouté(s), ${r.upd} mis à jour.`+(r.apps?` ${r.apps} feuille(s) d’application intégrée(s).`:'')+(r.ign?` ${r.ign} ligne(s) ignorée(s) (élève absent de la liste).`:'');
  await elevesRefresh();bilan()}catch(e){m.className='rgpd ko';m.textContent='❌ '+(e&&e.message||e)}}
$('#fileList').onchange=e=>{const f=e.target.files[0];if(f)importer(f,'#eMsg');e.target.value=''};
$('#fileImp').onchange=e=>{const f=e.target.files[0];if(f)importer(f,'#bMsg');e.target.value=''};

/* ───── Saisie (module partagé) ───── */
const saisie=LS.mount($('#saisie'),{
 getBaremes:()=>BAR,isCustom,
 provMsg:'⚠ Barème provisoire (copie du barème javelot) : saisis le barème officiel de cette épreuve dans l’onglet « Barème ».',
 getWho:()=>cur?{nom:cur.nom.toUpperCase()+' '+cur.prenom,classe:cur.classe,ok:true}:{nom:'',classe:'',ok:false,msg:'Sélectionne d’abord un élève (classe puis élève) pour enregistrer dans Mes Apps EPS.'},
 saveLabel:'💾 Enregistrer dans Mes Apps EPS',
 onSave:async l=>{await EPS.addLigne(APP_ID,cur.id,l);return `✅ Enregistré pour ${cur.nom.toUpperCase()} ${cur.prenom} (${l['Épreuve']}, ${LS.fmt(l.Note_totale,1)}/20).`}
});

/* ───── Bilan par classe ───── */
async function bilan(){
 await elevesRefresh();const c=$('#bc').value,ep=$('#be').value,rows=[];
 for(const e of L){if(c&&e.classe!==c)continue;const d=(e.ext||{})[APP_ID],ls=d&&Array.isArray(d.lignes)?d.lignes:[];
  for(const l of ls){if(ep&&l['Épreuve']!==ep)continue;rows.push({e,l})}}
 rows.sort((a,b)=>(a.e.classe||'').localeCompare(b.e.classe||'','fr',{numeric:true})||(a.e.nom+a.e.prenom).localeCompare(b.e.nom+b.e.prenom,'fr')||String(a.l.Date).localeCompare(String(b.l.Date)));
 let h='',g=null;
 for(const{e,l}of rows){if(!c&&e.classe!==g){g=e.classe;h+=`<tr class="gp"><td colspan="8">${esc(g||'Sans classe')}</td></tr>`}
  h+=`<tr><td class="nm">${esc(e.nom.toUpperCase())} ${esc(e.prenom)}</td><td>${esc(String(l.Date||'').split('-').reverse().join('/'))}</td><td>${esc(l['Épreuve'])}</td><td>${esc(l['Catégorie']||'')}</td><td>${LS.fmt(l.Meilleur_m)}</td><td>${LS.fmt(l.M3_m)}</td><td>${l['Prévision_m']!=null?LS.fmt(l['Prévision_m']):'–'}</td><td><b>${LS.fmt(l.Note_totale,1)}</b></td></tr>`}
 $('#bTb').innerHTML=h||'<tr><td colspan="8">Aucune saisie pour le moment.</td></tr>';
 const notes=rows.map(r=>+r.l.Note_totale).filter(isFinite);
 $('#bSum').textContent=rows.length?`${rows.length} saisie(s) · ${new Set(rows.map(r=>r.e.id)).size} élève(s) · moyenne ${LS.fmt(notes.reduce((s,v)=>s+v,0)/(notes.length||1),1)} / 20`:'';
}
$('#bc').onchange=$('#be').onchange=bilan;
async function exporter(opts,nom){const m=$('#bMsg');try{EPS.downloadXLSX(await EPS.exportXLSX(opts),nom+new Date().toISOString().slice(0,10)+'.xlsx');m.className='rgpd ok';m.textContent='✅ Fichier exporté.'}catch(e){m.className='rgpd ko';m.textContent='❌ '+(e&&e.message||e)}}
$('#expAll').onclick=()=>exporter(null,'Mes_Apps_EPS_');
$('#expMe').onclick=()=>exporter({apps:[APP_ID]},'Lancers_');

/* ───── Éditeur de barème ───── */
const rowsOf=k=>{const B=draft[$('#bEp').value];return k==='prev'?B.prevision:B.bareme[$('#bSx').value][k]};
function tbl(k,titre,col1,rows){return `<div class="bt"><h3>${titre}</h3><table><tr><th>${col1}</th><th>Note</th><th></th></tr>`
 +rows.map((r,i)=>`<tr><td><input inputmode="decimal" data-k="${k}" data-i="${i}" data-c="0" value="${r[0]}"></td><td><input inputmode="decimal" data-k="${k}" data-i="${i}" data-c="1" value="${r[1]}"></td><td><button class="del" data-del="${k}" data-i="${i}" title="Supprimer">✕</button></td></tr>`).join('')
 +`</table><div class="row" style="margin-top:6px"><button class="btn r" data-add="${k}">+ Ajouter une ligne</button></div></div>`}
function renderBar(){const ep=$('#bEp').value,B=draft[ep],sx=$('#bSx').value;
 $('#bTables').innerHTML=tbl('best','Meilleure performance – note /8','Distance ≥ (m)',B.bareme[sx].best)+tbl('m3','Moyenne des 3 meilleurs (M3) – note /8','Distance ≥ (m)',B.bareme[sx].m3)+tbl('prev','Justesse de la prévision – note /4 (commun filles/garçons)','Écart ≥ (m)',B.prevision);
 const p=B.provisoire&&pure(draft,ep)===pure(DEF,ep);$('#bProv').hidden=!p;$('#bProv').textContent=p?'⚠ Barème provisoire : copie du javelot. Remplace-le par le barème officiel de cette épreuve puis enregistre.':''}
$('#bEp').onchange=$('#bSx').onchange=renderBar;
$('#bTables').addEventListener('input',e=>{const t=e.target;if(!t.dataset.k)return;const v=parseFloat(String(t.value).replace(',','.'));rowsOf(t.dataset.k)[+t.dataset.i][+t.dataset.c]=isFinite(v)?v:NaN});
$('#bTables').addEventListener('click',e=>{const d=e.target.closest('[data-del]'),a=e.target.closest('[data-add]');
 if(d){rowsOf(d.dataset.del).splice(+d.dataset.i,1);renderBar()}
 if(a){const r=rowsOf(a.dataset.add),l=r[r.length-1];r.push(l?[l[0],l[1]]:[0,0]);renderBar()}});
function normaliser(b){for(const ep of LANCERS.EPREUVES){const B=b[ep];for(const sx of['F','G'])for(const k of['best','m3'])B.bareme[sx][k].sort((x,y)=>x[0]-y[0]);B.prevision.sort((x,y)=>y[0]-x[0])}}
function msg2(t,ok){const m=$('#bMsg2');m.className='rgpd '+(ok?'ok':'ko');m.textContent=t}
$('#bSave').onclick=()=>{const d=cp(draft);normaliser(d);const err=LANCERS.verifier(d);
 if(err.length)return msg2('❌ '+err.slice(0,3).join(' · ')+(err.length>3?` (+${err.length-3} autre(s))`:''),false);
 for(const ep of LANCERS.EPREUVES)if(pure(d,ep)!==pure(BAR,ep))d[ep].provisoire=false;
 BAR=d;draft=cp(BAR);const ok=sauver();renderBar();saisie.refresh();
 msg2(ok?'✅ Barème enregistré sur cet appareil.':'⚠ Barème appliqué mais non conservé : le stockage du navigateur est indisponible. Pense à l’exporter (.json).',ok)};
$('#bReset').onclick=()=>{const ep=$('#bEp').value;if(!confirm('Revenir au barème par défaut pour cette épreuve ?'))return;draft[ep]=cp(DEF[ep]);renderBar();msg2('Barème par défaut chargé : clique sur « Enregistrer le barème » pour l’appliquer.',true)};
$('#bCopyGo').onclick=()=>{const s=$('#bCopy').value,ep=$('#bEp').value;if(!s)return msg2('Choisis l’épreuve source.',false);if(s===ep)return msg2('Source et destination identiques.',false);
 draft[ep].bareme=cp(draft[s].bareme);draft[ep].prevision=cp(draft[s].prevision);renderBar();msg2('Barème copié : adapte les seuils puis enregistre.',true)};
$('#bExp').onclick=()=>{const d=cp(draft);normaliser(d);const o={};for(const ep of LANCERS.EPREUVES)o[ep]={bareme:d[ep].bareme,prevision:d[ep].prevision};
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:'application/json'}));a.download='Lancers_bareme_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
$('#bImp').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 try{const s=JSON.parse(await f.text()),d=cp(draft);let n=0;
  for(const ep of LANCERS.EPREUVES)if(s[ep]&&s[ep].bareme&&s[ep].prevision){d[ep].bareme=s[ep].bareme;d[ep].prevision=s[ep].prevision;n++}
  if(!n)throw new Error('aucun barème reconnu dans ce fichier');normaliser(d);const err=LANCERS.verifier(d);if(err.length)throw new Error(err[0]);
  draft=d;renderBar();msg2(`✅ ${n} barème(s) chargé(s) : clique sur « Enregistrer le barème » pour les appliquer.`,true)}catch(x){msg2('❌ Fichier invalide : '+(x&&x.message||x),false)}};

renderBar();elevesRefresh();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
