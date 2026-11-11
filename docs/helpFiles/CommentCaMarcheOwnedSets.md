# Gestion des Extensions Possédées (Owned Sets)

Pour simplifier l'interface et adapter l'application à votre collection réelle de cartes Dominion, vous pouvez configurer l'affichage pour ne faire apparaître que les extensions que vous possédez physiquement.

---
## 1. Activation de la Configuration

- **Option d'activation** : Activez l'interrupteur "Utiliser une configuration personnalisée pour l'affichage des sets" (Use Custom Configuration for Set Display) dans les paramètres.
- **Sélection des sets** : Cochez individuellement chaque boîte d'extension présente dans votre collection. Vous pouvez utiliser le bouton "Tout Sélectionner" pour cocher rapidement toutes les extensions.
- **Options de tri** : Triez la liste des extensions par ordre **Alphabétique** ou par **Date** de sortie pour retrouver vos boîtes plus facilement.
- **Gestion des éditions** : Pour les sets disposant de plusieurs versions (ex: Intrigue 1ère et 2ème édition), vous pouvez activer ou désactiver chaque édition séparément.

---
## 2. Impact sur la Page Principale (Génération Aléatoire)

L'exclusion d'une extension modifie le comportement de la page d'accueil de la manière suivante :
- **Filtres simplifiés** : Seules les extensions sélectionnées comme possédées s'affichent dans la liste des sets sélectionnables pour la génération de deck.
- **Désélection automatique** : Si une extension exclue était précédemment sélectionnée pour la génération, elle est automatiquement désélectionnée.
- **Invalidation du deck courant** : Si le deck actuellement affiché contient des cartes issues d'extensions exclues, celles-ci seront considérées comme invalides.

---
## 3. Impact sur les Jeux Prédéfinis (Predefined Games)

- **Masquage des filtres** : Dans la section des jeux prédéfinis, les extensions non sélectionnées n'apparaissent plus dans la liste des filtres.
- **Filtrage des scénarios** : Lorsque vous parcourez les parties suggérées d'une extension possédée, tous les scénarios de jeu nécessitant au moins une carte provenant d'une extension exclue sont automatiquement masqués. Vous n'avez ainsi accès qu'aux configurations jouables avec vos cartes physiques.

---
## 4. Impact sur les Règles de Jeu (Rules)

- **Mosaïque épurée** : Seules les règles des extensions cochées comme possédées sont affichées dans la mosaïque des règles de l'application.

---
## 5. Impact sur le Contenu des Boîtes (Box Contents)

- **Visualisation ciblée** : Seules les extensions définies comme possédées restent visibles dans la liste de présentation du contenu des boîtes.
- **Ajustement automatique** : Si la boîte actuellement visualisée est exclue de vos possessions, l'application bascule automatiquement sur la première boîte possédée restante dans la liste.
