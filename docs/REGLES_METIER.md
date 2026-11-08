# RescueOps — Contrat métier applicable (NE PAS MODIFIER)

Le projet simule des drones de secours, sans pilotage ni données de victimes réelles. Le **contrat** prime sur les commentaires ou les comportements actuels du code. Les entrées de `createMission` et `createDrone` sont supposées bien formées dans ce TP ; la validation à effectuer porte sur les fonctions précisées.

| Réf. | Exigence vérifiable |
|---|---|
| RO-01 | L'énergie nécessaire (`estimateEnergy`) est `Math.ceil(distanceKm * 4 + payloadKg * 3 + 5)` en points fictifs. Pour 5 km et 2 kg : **31 points**. Pour 1 km et 0 kg : **9 points**. La formule ne doit pas être changée. |
| RO-02 | `distanceKm` doit être de type number, finie, **strictement positive**. `payloadKg` doit être de type number, finie et comprise entre **0 et 5 inclus**. Toute autre valeur déclenche `RangeError` avant calcul. |
| RO-03 | `deployDrone` ne peut affecter qu'un drone `available` à une mission `planned`. Tout refus lève `Error` sans modifier ses entrées. Aucune autre fonction ne peut faire passer une mission de `planned` à `en_route`. |
| RO-04 | Un déploiement est autorisé uniquement si `drone.batteryPoints - estimateEnergy(...) >= 20`. Si ce minimum n'est pas atteint, `deployDrone` lève `RangeError` avant toute modification. Exemple : avec 31 points requis, un drone à 50 points est refusé, un drone à 51 points est autorisé. La batterie est exprimée en points fictifs (non en consommation physique réelle). |
| RO-05 | Un déploiement accepté produit **de nouveaux objets** : drone `busy`, batterie diminuée du coût ; mission `en_route`, `droneId` affecté, `en_route` ajouté à `history`. Les objets d'origine restent strictement inchangés. |
| RO-06 | `advanceMission` n'autorise que `en_route -> on_site -> returning -> closed`, une étape à la fois. Les retours, sauts, répétitions, étapes depuis `planned` et transitions depuis `closed`/`canceled` sont interdits ; lever `Error` et ne pas muter la source. |
| RO-07 | `cancelMission` n'est permis que lorsque la mission est `planned`. Le résultat est un nouvel objet `canceled` avec l'historique augmenté. Une mission déjà déployée, terminée ou annulée ne peut être annulée ; lever `Error` sans mutation. |
| RO-08 | Le suivi public JS `getPublicStatus` contient **exactement** `id`, `status`, `history`. `history` est une **copie**. Ne divulguer ni `contactEmail`, ni `gps`, ni `priority`, ni `droneId`. |
| RO-09 | La carte publique PHP `MissionCard::publicCard` contient **exactement** `id`, `statusLabel`. Garder les libellés fournis. Ne divulguer ni contact ni coordonnées GPS. |
| RO-10 | Chaque constat d'audit cite sa règle, ses entrées, la sortie constatée avant correction, la sortie attendue et sa preuve après correction. Les anciens scénarios conformes restent verts. |
| RO-11 | Livraison via une PR depuis le fork étudiant vers `main` du dépôt formateur, avec code, tests, audit rempli, description sincère de PR et revue/auto-revue identifiée. Ne pas merger la PR sans accord. |

## Échelle de priorité pédagogique

P0 : défaut bloquant avant livraison, mettant en cause l'exécution sûre de la simulation ou une donnée personnelle publique ; P1 : contrat fonctionnel important à corriger ; P2 : dette différable et documentée. Donner **la raison**, pas seulement le niveau.

## Valeurs métier et exemple de scénario

Données fictives : mission `SOS-204`, contact `famille@example.test`, GPS fictif `{lat:45.1201, lon:5.7123}`, distance 5 km, charge 2 kg, drone DR-07 à 70 points. Après déploiement correct : énergie 31, batterie 39, mission `en_route`. Pour 35 points au départ : refus. Pour 51 : réserve restante 20, accepté. Toute valeur provenant d'un système réel de secours est exclue de ce TP.
