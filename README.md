# RESCUEOPS — Mission de secours par drone (simulation)

**TP autonome B2 — audit, correctifs, tests, Git, PR et revue.** Application fictive : dispatch de drones transportant du matériel de secours vers une intervention. C'est une **simulation pédagogique de règles logicielles**, sans interface de commande d'un drone réel et sans conseil opérationnel aéronautique.

Le code est volontairement **lisible**, mais comporte des défauts dans la validation d'énergie, la mise à disposition des drones, les transitions, l'annulation et les vues publiques.

## Prérequis

Node.js >=18 ; PHP CLI >=8 ; Git ; compte GitHub. Aucun paquet npm externe, aucune base de données, aucun token ni service tiers.

## Point de départ

```bash
npm test
php tests/MissionCard.test.php
php -l src/php/MissionCard.php
npm run demo
```

Les tests initiaux sont tous verts. Cela ne signifie pas que le cahier des règles est respecté ! Lire `docs/REGLES_METIER.md` avant de modifier le code.

## Scénario principal

Une mission **SOS-204** nécessite un aller-retour de 5 km avec 2 kg de matériel. Le coût fictif est de 31 points de batterie. Un drone **DR-07** disponible, doté de 70 points, peut partir et conserve 39 points. Un drone à 35 points **ne peut pas partir** car la réserve contractuelle de 20 points ne serait pas respectée.

Une mission passe de `planned` à `en_route` uniquement par affectation d'un drone ; elle progresse ensuite en `on_site`, `returning`, `closed`. Elle n'est annulable qu'avant le déploiement. Les informations de contact et GPS restent **internes**.

## Travail à remettre

Le fichier `docs/LIVRABLES.md` et le sujet PDF définissent les attendus. Pour GitHub, suivre `docs/PROCEDURE_GITHUB.md` : fork du dépôt formateur, branche, Draft PR, puis une même PR finale. Toutes les données (`example.test`, GPS factice) sont fictives.
