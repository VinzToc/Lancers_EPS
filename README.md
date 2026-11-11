# Lancers'Projet (espace professeur)
PWA intégrée à Mes Apps EPS — identifiant d'application : `lancers`.
Déploiement : dépôt `Lancers_EPS` → Settings → Pages → `main` / root → https://vinztoc.github.io/Lancers_EPS/
Puis ajouter la ligne de `portails/apps_json_a_ajouter.txt` dans `apps.json` de `Mes_Apps_EPS`.

## Fonctions
- **Saisie** : épreuve (javelot, disque, poids), catégorie (filles/garçons), prévision M3, 6 essais, note /20 en direct (8 + 8 + 4), enregistrement dans Mes Apps EPS (`EPS.addLigne('lancers', …)`, mode « lignes »), fiche imprimable (Imprimer → Enregistrer au format PDF).
- **Bilan** : saisies par classe/épreuve, export du fichier compilé (.xlsx) ou de la feuille `lancers` seule, import d'un .xlsx (fichiers d'élèves).
- **Barème** : tableaux modifiables par épreuve et catégorie (seuils → notes), copie d'une épreuve à l'autre, export/import .json, retour au barème par défaut. Stocké dans le navigateur (`localStorage`, clé `lancers_bareme_v1`).

## Barèmes
`bareme-defaut.js` : javelot = fiche « Évaluation LANCER de JAVELOT (Niveau 4) ». Disque et poids = copie PROVISOIRE du javelot (à remplacer par les barèmes officiels).
Règle : note du plus haut seuil atteint (≥) ; sous le premier seuil → 0. Note finale = meilleur lancer (/8) + M3 (/8) + justesse de la prévision (/4).

## Fichiers
index.html · app-prof.js · lancers-saisie.js · lancers-core.js · bareme-defaut.js · lancers.css · eps-core.js (v2.3) · version.js · sw.js · manifest.webmanifest · icons/
