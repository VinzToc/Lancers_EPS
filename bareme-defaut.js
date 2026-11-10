/* bareme-defaut.js — barèmes par défaut. Format : [[seuil_en_m, note], ...] triés par seuil croissant.
   Règle : la note attribuée est celle du plus haut seuil ATTEINT (performance ≥ seuil) ; en dessous du 1er seuil → 0.
   best = meilleure performance (/8) · m3 = moyenne des 3 meilleurs essais (/8) · prevision = écart |prévu − réel| (/4).
   Javelot : barème de la fiche « Évaluation LANCER de JAVELOT (Niveau 4) » (niveau 4 en cours d'acquisition + niveau 4 acquis fusionnés).
   Disque et Poids : AUCUN barème n'a été fourni → copie PROVISOIRE du javelot (provisoire:true). À remplacer ici (un seul endroit)
   ou, côté professeur, dans l'onglet « Barème ». */
const BAREME_JAVELOT={
 F:{
  best:[[7.0,0.4],[7.5,0.8],[7.8,1.2],[8.0,1.6],[8.9,2.0],[9.9,2.4],[10.9,2.8],[11.9,3.2],[12.9,3.6],[13.9,4.0],[14.9,4.4],[15.9,4.8],[17.0,5.2],[18.1,5.6],[19.2,6.0],[20.2,6.4],[21.3,6.8],[22.4,7.2],[23.5,7.6],[24.7,8.0]],
  m3:[[6.0,0.4],[6.5,0.8],[7.0,1.2],[7.5,1.6],[7.8,2.0],[8.0,2.4],[8.9,2.8],[9.9,3.2],[10.9,3.6],[11.9,4.0],[12.9,4.4],[13.9,4.8],[14.9,5.2],[15.9,5.6],[17.0,6.0],[18.1,6.4],[19.2,6.8],[20.2,7.2],[21.3,7.6],[22.4,8.0]]
 },
 G:{
  best:[[11.0,0.4],[11.5,0.8],[11.8,1.2],[12.0,1.6],[13.4,2.0],[14.7,2.4],[16.1,2.8],[17.5,3.2],[19.0,3.6],[20.5,4.0],[21.9,4.4],[23.5,4.8],[25.0,5.2],[26.6,5.6],[28.6,6.0],[29.8,6.4],[31.4,6.8],[33.1,7.2],[34.1,7.6],[36.5,8.0]],
  m3:[[10.0,0.4],[10.5,0.8],[11.0,1.2],[11.5,1.6],[11.8,2.0],[12.0,2.4],[13.4,2.8],[14.7,3.2],[16.1,3.6],[17.5,4.0],[19.0,4.4],[20.5,4.8],[21.9,5.2],[23.5,5.6],[25.0,6.0],[26.6,6.4],[28.6,6.8],[29.8,7.2],[31.4,7.6],[33.1,8.0]]
 }
};
/* Justesse de la prévision : écart (en m) → note /4. Écart ≤ seuil_max le plus petit… stocké sous forme [écart_min_inclus, note] triée par écart décroissant. */
const BAREME_PREVISION=[[5,0],[4.5,0.5],[4,1],[3.5,1.5],[3,2],[2.5,2.5],[2,3],[1.5,3.5],[0,4]];

const BAREMES_DEFAUT={
 javelot:{nom:'Javelot',emoji:'🎯',engin:{F:'600 g',G:'700 g'},provisoire:false,bareme:BAREME_JAVELOT,prevision:BAREME_PREVISION},
 disque:{nom:'Disque',emoji:'🥏',engin:{F:'',G:''},provisoire:true,bareme:BAREME_JAVELOT,prevision:BAREME_PREVISION},
 poids:{nom:'Poids',emoji:'⚫',engin:{F:'',G:''},provisoire:true,bareme:BAREME_JAVELOT,prevision:BAREME_PREVISION}
};
