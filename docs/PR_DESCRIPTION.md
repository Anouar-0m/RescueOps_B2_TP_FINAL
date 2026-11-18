# [RescueOps] Audit et correctifs RO-02 à RO-09 : énergie, affectation, cycle de vie, confidentialité

## Problème observé

Les 8 tests d'origine étaient verts alors que le contrat `docs/REGLES_METIER.md` n'était pas respecté. Sur le scénario SOS-204, la démo acceptait un drone à 35 points (réserve restante 4 au lieu d'au moins 20), la vue publique JS et la carte PHP exposaient le courriel de contact et le GPS, et les transitions et l'annulation de mission n'étaient pas contrôlées.

## Exigences traitées : RO-xx et constats A-xx

| Constat | Règle | Résumé | Priorité |
|---|---|---|---|
| A-01 | RO-02 | Validation de `distanceKm` et `payloadKg` (`RangeError`) | P1 |
| A-02 | RO-04 | Réserve minimale de 20 points au départ | P0 |
| A-03 | RO-03, RO-05 | Seul un drone `available` part sur une mission `planned` ; nouveaux objets | P0 |
| A-04 | RO-06 | Transitions strictes `en_route -> on_site -> returning -> closed` | P1 |
| A-05 | RO-07 | Annulation uniquement depuis `planned` | P1 |
| A-06 | RO-08 | Vue publique JS : `id`, `status`, `history` (copie) | P0 |
| A-07 | RO-09 | Carte PHP : `id`, `statusLabel` | P0 |

Détail, entrées, sorties avant correction et raison des priorités : `docs/RAPPORT_AUDIT.md`. RO-01 (formule) est inchangée, RO-10 est couvert par le rapport, RO-11 par cette PR.

## Correctifs (fichier / fonction / comportement)

- `src/energy.js` / `estimateEnergy` : `RangeError` si la distance n'est pas un nombre fini strictement positif, ou si la charge n'est pas un nombre fini compris entre 0 et 5 inclus. Formule inchangée.
- `src/dispatch.js` / `deployDrone` : `Error` si le drone n'est pas `available` ou si la mission n'est pas `planned` ; `RangeError` si `batterie - coût` est inférieur à 20 (garde « fail-closed », voir revue R-01) ; aucun effet sur les entrées en cas de refus. Résultat d'un départ accepté inchangé.
- `src/mission.js` / `advanceMission` : table de transitions autorisées uniquement ; `Error` sinon. `cancelMission` : autorisée seulement depuis `planned`.
- `src/public.js` / `getPublicStatus` : retourne seulement `id`, `status` et une copie de `history`.
- `src/php/MissionCard.php` / `publicCard` : suppression de `contactEmail` et `gps` ; libellés conservés.
- Tests ajoutés dans les fichiers existants : T09 à T23 (JS) et P04 à P08 (PHP, 13 vérifications au total). Les signatures des fonctions et les tests T01 à T08 sont conservés.

## Tests réellement exécutés : commandes et résultats

Sur mon poste (Windows, PowerShell), dépôt `RescueOps_B2_TP_FINAL` :

- Avant correctifs (code S0, nouveaux tests présents) : `npm test` donne 22 tests, 11 réussis, 11 en échec (T09, T10, T12, T13, T14, T17, T18, T19, T20, T21, T22). `npm run demo` affiche « ACCEPTÉ : réserve après départ = 4 (risque métier) ».
- Après correctifs : `npm test` donne 22 tests, 22 réussis, 0 échec. `npm run demo` affiche « REFUSÉ : Insufficient battery reserve ».
- Après revue (R-01) : T23 observé rouge (1 échec) puis vert ; `npm test` final : 23 tests, 23 réussis, 0 échec.
- PHP 8.4.27 : `php tests/MissionCard.test.php` donne 13 vérifications conformes ; `php -l src/php/MissionCard.php` donne « No syntax errors detected ». Avec le fichier `MissionCard.php` du commit S0 restauré temporairement, le test échoue sur P04 (clés `id`, `statusLabel`, `contactEmail`, `gps`) ; ce rouge a été observé après les correctifs, PHP n'étant pas encore installé.

## Non-régression / objets non mutés

T01 à T08 (scénarios d'origine) sont verts avant et après. T04, T14, T15, T16, T17, T18, T19 et T23 comparent les entrées avec `structuredClone` avant et après l'appel : aucun refus ni départ accepté ne modifie les objets fournis. `getPublicStatus` ne partage plus le tableau `history` interne (T22).

## Risques résiduels et dette D-01

- D-01 : pas d'intégration continue, les tests Node et PHP sont lancés à la main (détail dans le rapport).
- `createMission` et `createDrone` ne valident pas leurs entrées : hors contrat (supposées bien formées). La garde de batterie reste néanmoins sûre face à `NaN` (T23).
- `MissionCard::publicCard` avec un statut inconnu produit un avertissement PHP et un libellé nul (observé avec PHP 8.4.27) : comportement non défini par le contrat, laissé inchangé (revue R-02).

## Points précis à relire

- `src/dispatch.js`, garde de réserve : `!(drone.batteryPoints - energyUsed >= MIN_RESERVE_POINTS)`.
- `src/mission.js`, `Object.hasOwn(NEXT_STATUS, mission.status)` qui évite les clés héritées comme `constructor`.
- `src/php/MissionCard.php` : suppression de `contactEmail` et `gps` (vérifiée par P04 à P08).
- `tests/mission.test.js`, fonction `missionAt` qui construit chaque état par le parcours officiel.

## Modifications faites après revue (dans cette même PR)

Auto-revue identifiée dans `docs/REVUE.md` (aucun pair GitHub, aucune approbation inventée) :

- R-01 acceptée : garde de batterie rendue « fail-closed », test T23, commit `fix(revue)`.
- R-02 reportée : statut inconnu côté PHP, non défini par le contrat.

## Preuve de livraison
URL réelle : https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/3
Branche source dans mon fork : Anouar-0m/RescueOps_B2_TP_FINAL, branche `TP_RescueOps_Anouar_Omari`
Branche cible dans le dépôt du formateur : jcrangon/RescueOps_B2_TP_FINAL, branche `main`
Statut final de la PR : Ready for review (non mergée)
