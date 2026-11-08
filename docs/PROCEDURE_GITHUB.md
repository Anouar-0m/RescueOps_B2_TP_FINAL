# GitHub : fork, branche, Draft PR, suivi et livraison

Le formateur publie **seulement la base élève S0** sur un dépôt GitHub accessible aux forks. Il communique son URL. Remplacer `COMPTE_FORMATEUR`, `COMPTE_ELEVE`, `rescueops-tp-b2` par les valeurs réelles. Utiliser l'authentification GitHub habituelle (HTTPS avec Git Credential Manager ou SSH).

1. Dans le dépôt du formateur, cliquer sur **Fork**, destination : votre compte.
2. Cloner **votre fork** et créer une branche, jamais travailler directement sur `main` :

```bash
git clone https://github.com/COMPTE_ELEVE/rescueops-tp-b2.git
cd rescueops-tp-b2
git remote add upstream https://github.com/COMPTE_FORMATEUR/rescueops-tp-b2.git
git remote -v
git switch -c audit/rescueops
npm test
php tests/MissionCard.test.php
npm run demo
```

3. Renseigner réellement les champs auteur/date/commit dans `docs/RAPPORT_AUDIT.md`. Cette modification crée le premier commit nécessaire à une PR :

```bash
git rev-parse --short main
git add docs/RAPPORT_AUDIT.md
git commit -m "docs: initialise RescueOps audit"
git push -u origin audit/rescueops
```

4. Dans GitHub : dépôt du **formateur** -> `Pull requests` -> `New pull request` -> `compare across forks`. Choisir `base repository` = formateur/rescueops-tp-b2, `base` = main, `head repository` = élève/rescueops-tp-b2, `compare` = audit/rescueops. Cliquer **Create draft pull request**. Copier son URL réelle. Ne pas créer de PR à partir d'une branche identique à main sans commit.

5. Après chaque correctif :

```bash
npm test
php tests/MissionCard.test.php
php -l src/php/MissionCard.php
git diff --check
git status
git add src tests docs
git commit -m "fix: verifiable behavior corrected"
git push origin audit/rescueops
```

6. Terminer `docs/PR_DESCRIPTION.md`, copier le contenu dans la description sur GitHub, cliquer **Ready for review**. Pour une revue réelle, demander au pair de laisser des commentaires sur l'onglet Files changed ; sinon remplir `docs/REVUE.md` comme auto-revue sans inventer une approbation. Corriger sur la même branche, relancer les tests et `git push` pour mettre à jour **la même PR**.

7. Ne **pas merger** ; remettre l'URL réelle au formateur. Les modifications présentes seulement sur le PC (sans push) restent invisibles.

Si les forks sont bloqués par les permissions du dépôt, avertir le formateur ; ne pas prétendre avoir ouvert une vraie PR si ce n'est pas le cas.
