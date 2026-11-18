# Rapport d'audit — RescueOps

Auteur : Anouar Omari 
Pseudo GitHub : Anouar-0m
Date : 09/11/2026
Commit de base : 5e99359aa7cb8ad6a79a67a02373300e8b5a6873

Priorités : **P0** = défaut bloquant (exécution sûre de la simulation ou donnée personnelle publique) ; **P1** = contrat fonctionnel important ; **P2** = dette différable.
Scénario de référence : mission `SOS-204` (5 km, 2 kg, contact et GPS fictifs), drone `DR-07` à 70 points ; test avec `npm test`.

| ID | Règle RO | Fichier / fonction | Entrée, obtenu S0, attendu | Risque concret | Priorité P0/P1/P2 | Preuve du correctif (test / commit) |
|---|---|---|---|---|---|---|
| A-01 | RO-02 (et RO-01) | `src/energy.js` / `estimateEnergy` | Entrées : distance `0`, `-1`, `NaN`, `'5'`, `null` ; charge `5.1`, `-1`, `'2'`, `undefined`. Obtenu S0 : aucune exception ; `(0,2)` donne 11, `(-1,2)` donne 7, `('5',2)` donne 31, `(5,undefined)` donne `NaN`, `(5,5.1)` donne 41. Attendu : `RangeError` avant calcul ; formule inchangée (5 km / 2 kg = 31, 1 km / 0 kg = 9). | Un coût faux (sous-estimé ou `NaN`) fausse la décision de réserve de batterie en aval (voir A-02). | **P1** : contrat important, sans donnée personnelle ; devient bloquant seulement combiné à A-02, corrigé juste avant. | T09, T10 (rouges en S0, verts après) ; T11 et T01/T02 restent verts ; commit `78d8cc7` |
| A-02 | RO-04 | `src/dispatch.js` / `deployDrone` | Drone `DR-LOW` à 35 points sur SOS-204 (coût 31). Obtenu S0 : départ ACCEPTÉ, réserve restante 4 (sortie réelle de `npm run demo`) ; un drone à 50 points est aussi accepté (reste 19). Attendu : `RangeError` sans modification dès que `batterie - coût < 20` ; 50 refusé, 51 accepté (reste 20), 70 donne 39. | Un drone part sans la réserve contractuelle de 20 points : exécution non sûre de la simulation. | **P0** : c'est la règle de sécurité centrale du scénario principal, et le défaut est visible dans la démo. | T12, T14 (rouges en S0, verts après) ; commit `8682fd5` ; `npm run demo` affiche REFUSÉ après correction |
| A-03 | RO-03 (et RO-05) | `src/dispatch.js` / `deployDrone` | Drone `busy` (ou `maintenance`) ou mission `en_route`, `on_site`, `returning`, `closed`, `canceled`. Obtenu S0 : départ accepté, aucune erreur (T13 : « Missing expected exception (Error): drone busy »). Attendu : `Error` sans modification des entrées ; seul un drone `available` part sur une mission `planned`. | Double affectation d'un drone déjà occupé ; mission terminée ou annulée « ressuscitée » en `en_route`. | **P0** : états incohérents de la flotte et des missions, la simulation n'est plus fiable. | T13, T14 (rouges en S0), T15 (non-régression RO-05) ; commit `8682fd5` |
| A-04 | RO-06 (et RO-03) | `src/mission.js` / `advanceMission` | Entrées : `planned -> planned`, `planned -> en_route`, `closed -> planned`, `en_route -> closed`. Obtenu S0 : accepté dès que le statut cible est connu (T17 : « planned -> planned » ; T18 : « closed -> planned »). Attendu : seules les étapes `en_route -> on_site -> returning -> closed`, une à la fois ; tout le reste lève `Error` sans muter la source. | Saut, retour ou répétition d'étape ; `planned -> en_route` contourne `deployDrone` donc le contrôle de batterie. | **P1** : contrat fonctionnel important ; le contournement de la réserve est déjà traité par A-02 dans `deployDrone`. | T17, T18 (rouges en S0), T16 et T06 (verts avant et après) ; commit `9e10998` |
| A-05 | RO-07 | `src/mission.js` / `cancelMission` | Mission `en_route`, `on_site` ou `returning`. Obtenu S0 : annulation acceptée (seuls `closed` et `canceled` étaient refusés ; T19 : « annulation depuis en_route »). Attendu : annulation possible uniquement depuis `planned`, sinon `Error` sans mutation. | Une mission en cours est annulée alors qu'un drone est déjà parti. | **P1** : règle de cycle de vie importante, sans fuite de données. | T19 (rouge en S0), T07 (vert avant et après) ; commit `9e10998` |
| A-06 | RO-08 | `src/public.js` / `getPublicStatus` | Mission SOS-204 déployée. Obtenu S0 : clés `contactEmail`, `gps`, `history`, `id`, `priority`, `status` (T20 ; la démo affiche `famille@example.test` et le GPS) et `history` renvoyé par référence (T22). Attendu : exactement `id`, `status`, `history`, avec `history` copié ; ni `contactEmail`, ni `gps`, ni `priority`, ni `droneId`. | Divulgation publique d'une donnée personnelle (courriel) et de la position GPS ; modification possible de l'historique interne par l'appelant. | **P0** : donnée personnelle exposée publiquement. | T20, T21, T22 (rouges en S0, T08 vert avant et après) ; commit `273fb35` ; sortie de `npm run demo` limitée à `id`, `status`, `history` |
| A-07 | RO-09 | `src/php/MissionCard.php` / `MissionCard::publicCard` | Mission SOS-204 en `on_site`. Obtenu S0 (lecture du code) : la carte renvoie `id`, `statusLabel`, `contactEmail`, `gps`. Attendu : exactement `id` et `statusLabel` ; libellés existants conservés (Planifiée, En route, Sur place, Retour en cours, Terminée, Annulée). | Même fuite que A-06 côté PHP : courriel et GPS dans une carte publique. | **P0** : donnée personnelle exposée publiquement. | Tests P04 à P13 ajoutés dans `tests/MissionCard.test.php` ; commit `273fb35` ; **non exécuté sur mon poste, voir limites** |

## D-01 — Dette technique reportable

Risque / raison du report / mesure compensatoire / responsable ou déclencheur de réévaluation :

- **Risque** : aucun contrôle automatique à chaque push. Les tests Node (`npm test`) et PHP (`php tests/MissionCard.test.php`) ne sont lancés que manuellement ; une régression future peut passer inaperçue. Sur mon poste, PHP CLI n'est pas installé : le correctif PHP (A-07) n'a donc pas pu y être exécuté.
- **Raison du report** : une intégration continue (GitHub Actions avec Node et PHP) sort du périmètre du contrat RO-01 à RO-11 et ne modifie aucune règle métier ; elle ne bloque pas la livraison de ce TP.
- **Mesure compensatoire** : commandes exactes et résultats observés consignés dans cette PR ; relecteur invité à rejouer `npm test`, `php tests/MissionCard.test.php` et `php -l src/php/MissionCard.php` avec PHP CLI 8 ou plus.
- **Déclencheur de réévaluation** : avant tout nouveau correctif sur `src/php/` ou dès qu'un deuxième contributeur pousse sur le dépôt ; responsable : l'auteur de la PR (Anouar-0m).

## Contrôles AVANT correction

Commandes sur le code S0 (commit de base) avec les nouveaux tests déjà présents, résultats observés sur mon poste :

- `npm test` : **22 tests, 11 réussis, 11 en échec**. Verts : T01 à T08 (scénarios d'origine), T11, T15, T16. Rouges : T09, T10 (A-01) ; T12 (A-02) ; T13, T14 (A-03) ; T17, T18 (A-04) ; T19 (A-05) ; T20, T21, T22 (A-06). Exemples de messages : « Missing expected exception (RangeError): batterie 35 » ; « Missing expected exception (Error): drone busy » ; « Missing expected exception (Error): planned -> planned » ; clés obtenues `[ 'contactEmail', 'gps', 'history', 'id', 'priority', 'status' ]` au lieu de `[ 'history', 'id', 'status' ]`.
- `npm run demo` : « ACCEPTÉ : réserve après départ = 4 (risque métier) » et vue publique contenant `contactEmail`, `gps`, `priority`.
- `php tests/MissionCard.test.php` : **non exécuté** (`php` introuvable sur mon poste).

Limites : une boucle de test s'arrête à la première entrée fautive ; les autres valeurs de A-01 sont donc établies par la formule S0 inchangée, pas par une sortie de test par valeur. A-07 est établi par lecture du code, pas par exécution.

## Contrôles APRÈS correction

Commandes exécutées sur mon poste après les commits `78d8cc7`, `8682fd5`, `9e10998`, `273fb35` :

- `npm test` : **22 tests, 22 réussis, 0 échec** (les 8 tests d'origine T01 à T08 toujours verts).
- `npm run demo` : « REFUSÉ : Insufficient battery reserve » pour le drone à 35 points ; vue publique réduite à `id`, `status`, `history`.
- `php tests/MissionCard.test.php` et `php -l src/php/MissionCard.php` : **non exécutés** (`php` introuvable).

Après la revue (voir `docs/REVUE.md`, remarque R-01) : le test T23 a été ajouté, observé **rouge** (1 échec sur 23) puis **vert** après durcissement de la garde de batterie ; `npm test` final : **23 tests, 23 réussis, 0 échec**.

Limites : correctifs PHP non exécutés localement (voir D-01) ; aucun test sur les entrées de `createMission` et `createDrone`, supposées bien formées par le contrat.

## Conclusion d'audit

Sept écarts au contrat ont été trouvés et corrigés : quatre P0 (A-02, A-03, A-06, A-07 : réserve de batterie, affectation, fuites de données personnelles) et trois P1 (A-01, A-04, A-05). Les scénarios d'origine (T01 à T08) restent verts et la formule de RO-01 n'a pas changé. Le point non vérifié sur ma machine est le test PHP ; il doit être rejoué avec PHP CLI avant tout merge. La dette D-01 (absence d'intégration continue) est documentée et reportée.
