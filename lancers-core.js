/* lancers-core.js — moteur de calcul de l'évaluation « Lancers » (Javelot, Disque, Poids) — partagé versions prof / élève.
   Aucune dépendance. Les barèmes viennent de bareme-defaut.js (BAREMES_DEFAUT) ou d'un barème personnalisé passé en paramètre. */
const LANCERS=(function(){
 const EPREUVES=['javelot','disque','poids'];
 const cp=o=>JSON.parse(JSON.stringify(o));
 /* Note = celle du plus haut seuil atteint (valeur ≥ seuil) ; sous le 1er seuil → 0. */
 function noteSeuil(table,v){let n=0;for(const[s,p]of table){if(v>=s-1e-9)n=p;else break}return n}
 /* Prévision : table triée par écart décroissant ; note du 1er palier dont l'écart est ≥ au seuil. */
 function notePrevision(table,ecart){const t=[...table].sort((a,b)=>b[0]-a[0]);for(const[s,p]of t){if(ecart>=s-1e-9)return p}return t.length?t[t.length-1][1]:0}
 const num=v=>{if(v===null||v===undefined||v==='')return null;const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:null};
 function defaut(){return cp(BAREMES_DEFAUT)}
 /* essais : tableau de 6 valeurs (texte/nombre/vide). Essai nul = vide ou 0. */
 function calculer(ep,sexe,essais,prevision,baremes){
  const B=(baremes||BAREMES_DEFAUT)[ep],t=B.bareme[sexe];
  const valides=essais.map(num).filter(v=>v!==null&&v>0).sort((a,b)=>b-a);
  if(!valides.length)return null;
  const top=valides.slice(0,3),best=valides[0],m3=top.reduce((s,v)=>s+v,0)/top.length;
  const nb=noteSeuil(t.best,best),nm=noteSeuil(t.m3,m3);
  const prev=num(prevision);let ecart=null,np=0;
  if(prev!==null&&prev>0){ecart=Math.abs(m3-prev);np=notePrevision(B.prevision,ecart)}
  const r=x=>Math.round(x*100)/100;
  return{best:r(best),m3:r(m3),nbValides:valides.length,moinsDe3:valides.length<3,nb:r(nb),nm:r(nm),
   ecart:ecart===null?null:r(ecart),np:r(np),prevuSaisie:prev!==null&&prev>0,total:r(nb+nm+np)}
 }
 /* Validation d'un barème personnalisé : seuils strictement croissants, notes croissantes, plafonds respectés. */
 function verifier(b){const err=[];
  for(const ep of EPREUVES){const B=b[ep];if(!B){err.push(ep+' : barème absent');continue}
   for(const sx of['F','G'])for(const[k,max]of[['best',8],['m3',8]]){const t=B.bareme[sx][k];
    for(let i=0;i<t.length;i++){const[s,p]=t[i];
     if(!isFinite(s)||s<0||!isFinite(p)||p<0||p>max)err.push(`${B.nom} ${sx} ${k} ligne ${i+1} : valeur invalide (note 0 à ${max})`);
     if(i&&(s<=t[i-1][0]))err.push(`${B.nom} ${sx} ${k} ligne ${i+1} : les seuils doivent être croissants`);
     if(i&&(p<t[i-1][1]))err.push(`${B.nom} ${sx} ${k} ligne ${i+1} : les notes doivent être croissantes`)}}
   const pv=B.prevision;pv.forEach(([s,p],i)=>{if(!isFinite(s)||s<0||!isFinite(p)||p<0||p>4)err.push(`${B.nom} prévision ligne ${i+1} : valeur invalide (note 0 à 4)`)})}
  return err}
 return{EPREUVES,noteSeuil,notePrevision,calculer,defaut,verifier,num,cp}
})();
