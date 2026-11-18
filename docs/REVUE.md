# Trace de revue — RescueOps

PR : https://github.com/jcrangon/RescueOps_B2_TP_FINAL/pull/3
Auteur : Anouar Omari (Anouar-0m)
Relecteur (pair GitHub OU auto-revue explicitement indiquée) : **auto-revue** par l'auteur, Anouar Omari ; aucun pair GitHub disponible, aucune approbation ni aucun commentaire GitHub inventé
Date : 18/11/2026

| Remarque | Fichier / fonction / ligne | Règle et scénario vérifiable | Risque | Demande proposée | Réponse de l'auteur | Test / correction / verdict |
|---|---|---|---|---|---|---|
| R-01 | `src/dispatch.js` / `deployDrone` / garde de réserve, ligne 17 avant correction (`if (drone.batteryPoints - energyUsed < MIN_RESERVE_POINTS)`) | RO-04. Scénario : `{ ...drone(), batteryPoints: NaN }` (ou `'abc'`, ou `undefined`) sur SOS-204. `NaN - 31` vaut `NaN` et `NaN < 20` est faux : le refus ne se déclenche pas et le drone part avec une batterie `NaN`. | La règle de sécurité s'ouvre dès que la donnée n'est pas un nombre (comportement « fail-open »). | Écrire la garde dans le sens inverse, `!(reste >= 20)`, pour refuser tout ce qui n'est pas clairement suffisant, et ajouter un test. | D'accord : correctif d'une ligne, signature et scénarios positifs inchangés. La validation complète de `createDrone` reste hors contrat, mais la garde de sécurité ne doit pas dépendre de ça. | Test T23 observé rouge (1 échec sur 23) puis vert (23 sur 23) ; commit `fix(revue)`. **Verdict : accepté et corrigé.** |
| R-02 | `src/php/MissionCard.php` / `MissionCard::publicCard`, ligne 19 (`self::LABELS[$mission['status']]`) | RO-09. Scénario : `publicCard(['id' => 'SOS-204', 'status' => 'inconnu', ...])`. Observé avec PHP 8.4.27 : avertissement « Undefined array key » et `statusLabel` vaut `NULL`. | Carte publique avec un libellé nul et un avertissement visible si les erreurs sont affichées. | Lever une exception ou fournir un libellé de repli pour un statut inconnu. | Refusé pour cette PR : le contrat impose de garder les six libellés et ne définit rien pour un statut inconnu, donc choisir un comportement reviendrait à inventer une règle. Les statuts proviennent de `createMission` et `advanceMission`, qui ne produisent plus que les six valeurs connues. | Aucun changement de code. Noté en risque résiduel dans `docs/PR_DESCRIPTION.md`. **Verdict : reporté, non bloquant.** |

## Vérifications rejouées après réponse

- Après R-01 : `npm test` donne 23 tests, 23 réussis, 0 échec (T23 était rouge avant le correctif). `npm run demo` affiche toujours « REFUSÉ : Insufficient battery reserve » pour le drone à 35 points.
- Après R-02 : aucun changement de code ; le scénario a été observé avec PHP (avertissement et libellé nul).
- Diff relu avant chaque commit ; les scénarios d'origine T01 à T08 sont restés verts.
- PHP : `php tests/MissionCard.test.php` donne 13 vérifications conformes et `php -l src/php/MissionCard.php` est valide (PHP 8.4.27).

## Verdict final motivé (ne pas inventer une approbation GitHub)

Auto-revue : **prêt pour revue par le formateur**. R-01 est corrigée et prouvée par un test ; R-02 est reportée avec une raison explicite. Il ne s'agit ni d'une approbation GitHub ni d'une revue par un pair, et la PR ne doit pas être mergée sans l'accord du formateur.
