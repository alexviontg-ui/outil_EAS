# Outils techniques EAS

Web app statique qui réunit les trois outils de calcul d'Eau Air Système (Groupe Baudin Chateauneuf) :

| Route | Outil | Fichier |
|---|---|---|
| `#/` | Accueil | `index.html` |
| `#/acoustique` | Études acoustiques | `outils/acoustique.html` |
| `#/pertes-de-charge` | Pertes de charge | `outils/pertes-de-charge.html` |
| `#/dimensionnement` | Dimensionnement Ø gaines et tubes | `outils/dimensionnement.html` |
| `#/grilles-exterieures` | Grilles extérieures (VIM GMAA / GMAC) | `outils/grilles-exterieures.html` |

L'outil **Grilles extérieures** a été ajouté après coup. Il se base sur le catalogue VIM 2025 (GMAA 33, GMAA 80, GMAC 80, p. 1457 à 1460). Il propose la taille selon la surface libre Ak requise ou le débit et la vitesse maximale. Il donne aussi Vk et ΔP, et une estimation pour les dimensions sur mesure. Ses données sont enregistrées sous la clé `eas-grext-v1`. La méthode et ses limites sont décrites dans son onglet « Méthode ».

> Outils de pré-dimensionnement. Les résultats doivent être validés par une personne compétente avant toute diffusion.

## Principe

- `index.html` est la coquille : une barre de navigation commune et la page d'accueil.
- Chaque outil s'affiche dans son propre `<iframe>` de même origine, sans attribut `sandbox`, avec `allow="clipboard-write"`. Le fichier HTML de l'outil est servi tel quel. Son CSS, son JavaScript global, son `localStorage` (`eas-acou-v1`, `eas-pdc-v1`, `eas-dim-v1`) et son `location.hash` restent indépendants.
- Les iframes déjà ouverts restent en mémoire, masqués. On retrouve donc l'outil dans l'état où on l'a laissé.
- Adresse partageable : `#/<outil>/<onglet>`, par exemple `#/pertes-de-charge/eau` ou `#/dimensionnement/evac`. L'onglet interne de l'outil est recopié dans l'adresse de la coquille. L'outil, lui, garde son propre hash (`#eau`, `#pieges`…).

## Structure

```
index.html                 coquille + accueil
assets/app.css             styles de la coquille (clair / sombre selon prefers-color-scheme)
assets/app.js              routage et navigation
outils/*.html              les trois outils
vendor/                    SheetJS 0.18.5, jsPDF 2.5.1, jsPDF-AutoTable 3.8.2 (copies locales)
serve.json                 réglages du serveur local « serve » (aucun effet sur un autre serveur)
package.json, scripts/     uniquement pour récupérer les bibliothèques et lancer un serveur local
MODIFICATIONS.diff         diff complet des outils par rapport aux fichiers d'origine
```

## Lancement local

Ouvrir `index.html` directement depuis l'explorateur (`file://`) n'est **pas** recommandé : selon le navigateur, l'accès aux iframes et le presse-papiers peuvent être bloqués. Passez par un petit serveur local :

```bash
npm install
```

```bash
npm start
```

Puis ouvrez http://localhost:8080/.

`npm install` télécharge les bibliothèques. `npm run vendor` les recopie dans `vendor/`, qui est déjà rempli et ne sert qu'en cas de mise à jour.

## Déploiement sur un serveur web interne

1. Copier sur le serveur : `index.html`, `assets/`, `outils/`, `vendor/`. `node_modules/`, `package*.json`, `scripts/` et `serve.json` ne sont pas nécessaires.
2. Servir le dossier en statique (IIS, Apache, Nginx…), de préférence en HTTPS. Le presse-papiers (`navigator.clipboard`) n'est autorisé par les navigateurs qu'en HTTPS ou sur `localhost`.
3. Aucun réglage particulier : pas de réécriture d'URL (le routage se fait dans le `#`), pas de serveur applicatif, pas de base de données.
4. Si le serveur envoie un en-tête `X-Frame-Options` ou `Content-Security-Policy: frame-ancestors`, il doit autoriser la même origine (`SAMEORIGIN` / `'self'`).
5. Hors connexion internet : tout fonctionne. Seules les polices IBM Plex (Google Fonts) ne se chargent pas, et les outils passent alors sur les polices système.

Les données restent dans le navigateur de chaque utilisateur (`localStorage`) et sont liées à l'adresse du site. Changer d'adresse de serveur repart donc de données vides. Pour transférer un projet, utilisez « Enregistrer le projet » (Pertes de charge) ou « Copier le fichier projet » (Acoustique).

## Logo

Le logo Eau Air Système s'affiche en haut à gauche de la barre (`assets/logo-eas.svg`, classe `.brand-logo`). Le SVG a été converti depuis `logo_EAS_vectorise.eps` (Illustrator CS4) en reprenant ses tracés. Le bleu PANTONE 2935 C y est rendu en `#0057B8`. Un fond blanc a été ajouté pour qu'il reste lisible en mode sombre.

Pour le remplacer, déposez un nouveau fichier `assets/logo-eas.svg`, ou un PNG en adaptant `src` dans `index.html`.

## Modifications faites dans les outils

`outils/acoustique.html` et `outils/dimensionnement.html` : **aucune modification** (fichiers identiques aux originaux, vérifié par empreinte SHA-256).

`outils/pertes-de-charge.html` : 2 adaptations, 4 lignes modifiées et 1 ligne ajoutée.

1. **Bibliothèques locales**, lignes 139 à 141 : les trois `<script src>` CDN pointent vers `../vendor/` (mêmes versions exactes).
2. **Téléchargements**, ligne 595 ajoutée : quand `window.claude` est absent, `DL` reçoit un objet de remplacement `{save({filename, data})}` qui renvoie une promesse et télécharge par `Blob` + `URL.createObjectURL` + `<a download>`. Le reste de la logique d'export ne change pas. Dans claude.ai, le mécanisme d'origine reste prioritaire.

```diff
@@ -138,5 +138,5 @@
-<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
-<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
-<script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>
+<script src="../vendor/xlsx.full.min.js"></script>
+<script src="../vendor/jspdf.umd.min.js"></script>
+<script src="../vendor/jspdf.plugin.autotable.min.js"></script>
@@ -594,2 +594,3 @@
 (async()=>{try{if(window.claude&&window.claude.use)DL=await window.claude.use("downloads")}catch(e){DL=null}
+  if(!DL)DL={save:({filename,data})=>new Promise((res,rej)=>{try{const type={xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",pdf:"application/pdf",json:"application/json"}[String(filename).split(".").pop().toLowerCase()]||"application/octet-stream";const u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement("a");a.href=u;a.download=filename;a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);res()}catch(e){rej({code:"erreur"})}})}; /* Adaptation app EAS : téléchargement navigateur standard hors claude.ai */
   if(!DL){["b-xlsx","b-pdf","b-pdfall","b-save"].forEach(id=>{ … })}})();
```

Le diff complet est dans `MODIFICATIONS.diff`.

## Point de vigilance

SheetJS `xlsx@0.18.5` est la dernière version publiée sur npm. Elle comporte des failles connues (pollution de prototype et ReDoS) qui concernent la **lecture** de classeurs piégés. L'outil ne fait qu'**écrire** des .xlsx, donc l'exposition est faible. Une version plus récente est distribuée par SheetJS hors npm (cdn.sheetjs.com) : la mise à jour est à décider avec le service informatique, puis à revalider.
