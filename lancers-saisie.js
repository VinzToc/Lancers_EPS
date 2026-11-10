/* lancers-saisie.js — interface de saisie « Lancers » partagée (version professeur et version élève).
   LS.mount(racine, opts) construit : choix de l'épreuve et de la catégorie, prévision, 6 essais, résultats en direct, enregistrement, fiche imprimable.
   opts : getBaremes() → barèmes en vigueur · isCustom(ep) → bool · provMsg (texte d'alerte « barème provisoire »)
          getWho() → {nom, classe, ok} (ok=false : enregistrement impossible) · saveLabel · onSave(ligne) → Promise<string> (message affiché) */
const LS=(function(){
 const $=(s,r)=>(r||document).querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fmt=(n,d)=>n===null||n===undefined?'–':Number(n).toFixed(d===undefined?2:d).replace('.',',');
 const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
 const SX={F:'Filles',G:'Garçons'};
 function mount(root,o){
  const st={ep:'javelot',sx:'F',r:null};
  root.innerHTML=`
  <div class="card"><h2>🏅 Épreuve</h2>
   <div class="pills" id="lsEp"></div>
   <h3>Catégorie</h3><div class="pills" id="lsSx"></div>
   <p class="rgpd" id="lsEngin"></p><p class="warn" id="lsProv" hidden></p></div>
  <div class="card"><h2>✍️ Performances</h2>
   <label>Prévision de la moyenne de tes 3 meilleurs essais (m)<input id="lsPrev" inputmode="decimal" placeholder="ex : 12,5" autocomplete="off"></label>
   <div class="grid3" id="lsEss"></div>
   <p class="rgpd">6 essais maximum. Essai nul : laisser vide ou saisir 0. Séparateur décimal : point ou virgule.</p></div>
  <div class="card" id="res"><h2>📋 Résultat <span id="lsBadge"></span></h2><div id="lsOut"></div>
   <div class="row"><button class="btn g" id="lsSave"></button><button class="btn b" id="lsPrint">🖨 Fiche PDF</button><button class="btn r" id="lsReset">↺ Nouvel élève / effacer</button></div>
   <p id="lsMsg" class="rgpd" style="font-weight:700"></p></div>`;
  $('#lsEss',root).innerHTML=[1,2,3,4,5,6].map(i=>`<label>Essai ${i} (m)<input class="ess" inputmode="decimal" placeholder="–" autocomplete="off"></label>`).join('');
  $('#lsSave',root).textContent=o.saveLabel||'💾 Enregistrer';
  const B=()=>o.getBaremes()[st.ep];
  function pills(){
   const bs=o.getBaremes();
   $('#lsEp',root).innerHTML=LANCERS.EPREUVES.map(e=>`<div class="pill ${e===st.ep?'on':''}" data-ep="${e}">${bs[e].emoji} ${esc(bs[e].nom)}</div>`).join('');
   $('#lsSx',root).innerHTML=['F','G'].map(s=>{const w=B().engin[s];return `<div class="pill ${s===st.sx?'on':''}" data-sx="${s}">${s==='F'?'👧':'👦'} ${SX[s]}${w?`<br><small>engin ${esc(w)}</small>`:''}</div>`}).join('');
   const w=B().engin[st.sx];$('#lsEngin',root).textContent=w?`Engin : ${w} (${SX[st.sx].toLowerCase()}).`:'';
   const prov=B().provisoire&&!o.isCustom(st.ep);$('#lsProv',root).hidden=!prov;$('#lsProv',root).textContent=prov?o.provMsg:'';
  }
  const vals=()=>[...root.querySelectorAll('.ess')].map(i=>i.value);
  function calc(){
   const B0=B(),r=LANCERS.calculer(st.ep,st.sx,vals(),$('#lsPrev',root).value,o.getBaremes());st.r=r;
   $('#lsBadge',root).innerHTML=o.isCustom(st.ep)?'<span class="badge">barème personnalisé</span>':(B0.provisoire?'<span class="badge p">provisoire</span>':'');
   const out=$('#lsOut',root);
   if(!r){out.innerHTML='<p class="rgpd">Saisis au moins un essai valide pour voir le résultat.</p>';$('#lsSave',root).disabled=true;$('#lsPrint',root).disabled=true;return}
   $('#lsSave',root).disabled=false;$('#lsPrint',root).disabled=false;
   out.innerHTML=`<div class="ln"><span>Meilleure performance</span><b>${fmt(r.best)} m</b></div>
    <div class="ln"><span>Moyenne des 3 meilleurs (M3)</span><b>${fmt(r.m3)} m</b></div>
    <div class="ln"><span>Note meilleure performance</span><b>${fmt(r.nb,1)} / 8</b></div>
    <div class="ln"><span>Note moyenne M3</span><b>${fmt(r.nm,1)} / 8</b></div>
    <div class="ln"><span>Écart prévision / réel</span><b>${r.ecart===null?'–':fmt(r.ecart)+' m'}</b></div>
    <div class="ln"><span>Note justesse de la prévision</span><b>${fmt(r.np,1)} / 4</b></div>
    ${r.moinsDe3?`<p class="warn">Moins de 3 essais valides : la moyenne M3 est calculée sur ${r.nbValides} essai(s).</p>`:''}
    ${r.prevuSaisie?'':'<p class="warn">Prévision non renseignée : 0 / 4 sur la justesse de la prévision.</p>'}
    <div class="total"><small>NOTE FINALE</small><span class="n">${fmt(r.total,1)}</span> <small style="display:inline">/ 20</small></div>`;
  }
  function ligne(){const r=st.r,v=vals().map(LANCERS.num),B0=B(),L={Date:today(),'Épreuve':B0.nom,'Catégorie':SX[st.sx]};
   v.forEach((x,i)=>{if(x!==null&&x>0)L['Essai_'+(i+1)]=x});
   const p=LANCERS.num($('#lsPrev',root).value);if(p!==null&&p>0)L['Prévision_m']=p;
   Object.assign(L,{'Meilleur_m':r.best,'M3_m':r.m3,'Note_meilleur':r.nb,'Note_M3':r.nm,'Note_prévision':r.np,'Note_totale':r.total,'Barème':o.isCustom(st.ep)?'personnalisé':(B0.provisoire?'provisoire':'défaut')});
   if(r.ecart!==null)L['Écart_m']=r.ecart;return L}
  function fiche(){const r=st.r,w=o.getWho(),B0=B(),v=vals().map(LANCERS.num);let f=$('#fiche');if(!f){f=document.createElement('div');f.id='fiche';document.body.appendChild(f)}
   const prov=B0.provisoire&&!o.isCustom(st.ep);
   f.innerHTML=`<h1>Évaluation – Lancer : ${esc(B0.nom)}</h1><p class="sub">${esc(w.nom||'Élève non renseigné')}${w.classe?' · Classe '+esc(w.classe):''} · ${SX[st.sx]}${B0.engin[st.sx]?' (engin '+esc(B0.engin[st.sx])+')':''} · ${new Date().toLocaleDateString('fr-FR')}</p>
   ${prov?'<div class="pv">Barème provisoire : à ne pas utiliser comme note officielle.</div>':''}
   <table><tr><th>Essai</th>${[1,2,3,4,5,6].map(i=>`<th>${i}</th>`).join('')}<th>Prévision M3</th></tr>
   <tr><td>Distance (m)</td>${v.map(x=>`<td>${x!==null&&x>0?fmt(x):'–'}</td>`).join('')}<td>${r.prevuSaisie?fmt(LANCERS.num($('#lsPrev',root).value)):'–'}</td></tr></table>
   <table><tr><th>Critère</th><th>Valeur</th><th>Note</th></tr>
   <tr><td>Meilleure performance (40 %)</td><td>${fmt(r.best)} m</td><td>${fmt(r.nb,1)} / 8</td></tr>
   <tr><td>Moyenne des 3 meilleurs essais (40 %)</td><td>${fmt(r.m3)} m</td><td>${fmt(r.nm,1)} / 8</td></tr>
   <tr><td>Justesse de la prévision (20 %)</td><td>écart ${r.ecart===null?'–':fmt(r.ecart)+' m'}</td><td>${fmt(r.np,1)} / 4</td></tr></table>
   <div class="tot">NOTE FINALE : ${fmt(r.total,1)} / 20</div>
   <p class="ft">Barème : ${o.isCustom(st.ep)?'personnalisé':'par défaut'} · Mes Apps EPS – Lancers</p>`}
  root.addEventListener('click',e=>{const p=e.target.closest('[data-ep]'),s=e.target.closest('[data-sx]');
   if(p){st.ep=p.dataset.ep;pills();calc()}if(s){st.sx=s.dataset.sx;pills();calc()}});
  root.addEventListener('input',calc);
  $('#lsReset',root).onclick=()=>{root.querySelectorAll('.ess,#lsPrev').forEach(i=>i.value='');$('#lsMsg',root).textContent='';calc();if(o.onReset)o.onReset()};
  $('#lsPrint',root).onclick=()=>{if(!st.r)return;fiche();window.print()};
  $('#lsSave',root).onclick=async()=>{const m=$('#lsMsg',root);if(!st.r)return;const w=o.getWho();
   if(!w.ok){m.className='rgpd ko';m.textContent=w.msg||'Sélectionne d’abord un élève.';return}
   try{m.className='rgpd ok';m.textContent=await o.onSave(ligne())}catch(e){m.className='rgpd ko';m.textContent='❌ '+(e&&e.message||e)}};
  pills();calc();
  return{refresh(){pills();calc()},state:st};
 }
 return{mount,fmt,esc,today,SX};
})();
