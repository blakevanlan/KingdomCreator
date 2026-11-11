# Génération d'un Deck de Cartes

L'algorithme de génération d'un deck de cartes (ou "kingdom") dans notre application suit plusieurs étapes, adaptées aux différents cas d'utilisation.   
Ci-après le mode Standard, sans application d’un paramétrage avancé spécifique.  

---
## 1. Sélection des Sets de Cartes

- **Choix des sets** : L'utilisateur sélectionne un ou plusieurs sets parmi ceux disponibles (par exemple, "Base", "Alchemy", "Seaside").
- **Contenu des sets** : Chaque set contient différents types de cartes
  * **Cartes Royaume** : Les cartes principales utilisées pour jouer.
  * **Cartes Complémentaires** : Événements (Events), repères (Landmarks), projets (Projects), etc...

---
## 2. Application des Contraintes pour Générer le Deck

L'utilisateur peut définir des contraintes spécifiques pour guider la génération aléatoire du deck. Ces contraintes permettent de personnaliser le deck en fonction des préférences ou des besoins stratégiques.

**Contraintes Disponibles :**

- **Require +2 Actions** : Nécessité d’avoir au moins une carte donnant +2 actions.
- **Require Drawer** : Nécessité d’avoir au moins une carte permettant de piocher des cartes.
- **Require Buy** : Nécessité d’avoir au moins une carte permettant d’obtenir des achats supplémentaires.
- **Allow Attack** : Autorisation d’inclure des cartes "Attaque" dans le deck.
- **Require Reaction** : Nécessité d’avoir au moins une carte "Réaction" pour contrer les cartes "Attaque".
- **3+ Alchemy Cards** : Si le set "Alchemy" est sélectionné, forcer la présence de 3 à 5 cartes de ce set.
- **Distribute Costs** : Équilibrer le coût des cartes dans le deck en s'assurant qu'entre 3 et 5 cartes coûteuses (5+) sont inclus dans le deck
- **Prioritize Sets** : Prioriser un set pour garantir qu'il soit bien représenté dans le deck par 5 cartes.

---
## 3. Aléatoire des Cartes « Royaume »

Une fois les sets sélectionnés, l'algorithme procède à la sélection des cartes Royaume.

**Étapes de Sélection :**

- **Déduplication des cartes** : Les cartes des sets sélectionnés sont dédupliquées pour éviter les doublons (gestion des cartes des 1<sup>ère</sup> 2<sup>ième</sup> édition ou des Update Packs).
- **Regroupement des cartes** : Les cartes sont regroupées selon un maximum de 4 critères :  
  * **Cartes du set "Alchemy"** : Si l’option "3+ Alchemy Cards" est activée ou avec une probabilité d’1 chance sur le nombre de sets sélectionnés.
  * **Cartes coûteuses** : Si l’option "Distribute Costs" est activée, les cartes coûtant plus de 5 pièces sont regroupées.
  * **Cartes du set priorisé** : Si l’option "Prioritize Sets" est activée, les cartes de ce set sont regroupées.
  * **Cartes restantes** : Toutes les autres cartes disponibles.
- **Satisfaction des contraintes** : Pour chaque contrainte de type "Require", si elle n’est pas satisfaite avec les cartes déjà sélectionnées, l'algorithme identifie les regroupements de cartes permettant de répondre à la contrainte et en sélectionne une ou plusieurs au hasard.

---
## 4. Vérification et Ajustements

Une fois les cartes initialement sélectionnées, l'algorithme vérifie que toutes les contraintes définies par l'utilisateur sont respectées. Si une contrainte n'est pas satisfaite, des ajustements sont effectués :

- **Ajout de cartes supplémentaires** : Des cartes peuvent être ajoutées pour répondre aux contraintes non satisfaites. C’est le cas pour la gestion de la présence des "Reaction"
- **Verrouillage des cartes sélectionnées** : Les cartes déjà sélectionnées sont verrouillées pour éviter qu'elles ne soient modifiées lors des ajustements.

**Gestion des Exceptions**
L'algorithme est conçu pour gérer les cas particuliers et les exceptions :
- **Manque de cartes disponibles** : Si un set ne contient pas suffisamment de cartes pour répondre aux contraintes, un message d'avertissement est affiché.
- **Conflits entre contraintes** : Si des conflits surviennent entre plusieurs contraintes, l'algorithme priorise celles qui ont le plus d'impact sur la jouabilité.

---
## 5. Ajout des Cartes Spéciales

En fonction des règles spécifiques de certains sets ou des options activées, des cartes spéciales peuvent être ajoutées au deck :

-   **Carte "Bane"** : Si la carte "Young Witch" est incluse, une carte "Bane" est automatiquement sélectionnée parmi les cartes disponibles respectant les critères de coût.
-   **Carte "FerrymanCard"**, **"RiverboatCard"** : Si les cartes correspondantes sont incluses, une ou des  carte complémentaire sont ajoutées en respectant les contraintes de coût, de type, ….
-   **Autres cartes spéciales** : Certaines cartes comme "Obelisk", "MouseWay",ou "Approaching Army" peuvent nécessiter l’ajout de cartes selon les règles spécifiques des sets.

---
## 6. Finalisation du Deck

Une fois toutes les contraintes respectées et les cartes spéciales ajoutées, l'algorithme finalise le deck :
- **Organisation des cartes** : Les cartes sont regroupées et organisées pour former un deck complet.
- **Gestion des remplacements** : Les remplacements possibles pour certaines cartes sont enregistrés, permettant à l'utilisateur de personnaliser le deck après sa génération.

---
## 7. Génération des Cartes Addons

En plus des cartes "Royaume", l'algorithme génère également des cartes complémentaires pour enrichir le deck. Ces cartes incluent les addons, les alliés (ally), les prophéties (prophecy) et les bénédictions (boons).
Les événements (Events), repères (Landmarks), projets (Projects), voies (Ways) et traits (traits) sont ajoutés comme suit :
*	Par défaut, 2 Addons maximum sont choisis, conformément à la préconisation des règles
*	Parmi toutes les cartes composants les sets sélectionné (après Déduplication), 2 fois le nombre de cartes de type Royaume (20 cartes) sont sélectionnées aléatoirement. Parmi ces cartes, les Addons sont retenus.

---
## 8. Complément et ajustement en fonction des Addons
Selon les cartes Royaume et les cartes Addons sélectionnées d’autres cartes peuvent être identifiée ou sélectionnées :
-	Si la carte Druide est présenté, 3 aubaines (Boons) sont sélectionnées aléatoirement
-	Si une carte Liaison est présente dans les cartes Royaume, une carte Allié (Ally) est sélectionnée aléatoirement.
-	Si une carte Omen est présente dans les cartes Royaume, une carte Prophétie (Prophecy) est sélectionnée aléatoirement.
-	Dans les cartes Royaume sont identifiées les cartes correspondant au besoin des cartes Obélisque (repère) (Obelisk (Landmark)), Voie de la souris (Voie) (Way of the mouse (Way)), l’armée en approche pour la prophétie Armée en Approche (Approaching Army Prophecy) et les cartes royaume à associer au traits.

---
## 9. Utilisation des Provinces/Platines et des Refuges (Shelters)
Selon 
- le nombre de cartes correspondant aux critères (Nb_Carte_Critère) (set Prospérité 1ère,2ème édition ou update pack ou Set Ages des Ténèbres), 
- le nombre des cartes dédupliquées (Nb_Cartes).  

Décision d’utiliser les Provinces et Platines ou les Refuges avec Nb_Carte_Critère chance sur Nb_Cartes aléatoirement.



---
# Les Tooltips de la page principale
Require +2 Action : include a card allowing 1 or more actions
Require Drawer : include a card allowing to draw cards
Require Buy : include a card allowing 1 or more extra buy
Allow Attacks : allow attacks card to be in the deck
Require Reaction : include a reaction card in the deck if an attack is present
Require Trashing : include a card allowing trash cards

3+ Alchemy Cards : include 3 or more card of Alchemy set in the deck
Distribute Cost : include 3 to 5 cards of cost 5 or more
Prioritize Set : include 5 cards of the selected set