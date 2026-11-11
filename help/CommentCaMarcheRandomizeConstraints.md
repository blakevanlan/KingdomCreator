# Contraintes de Génération Aléatoire (Randomize Constraints)

Pour affiner la génération de vos decks, l'application vous permet d'appliquer des contraintes précises sur le nombre de cartes issues de chaque extension et d'exclure certaines cartes spécifiques du tirage.

---
## 1. Activation des Contraintes

- **Option d'activation** : Activez l'interrupteur "Utiliser des contraintes sur la génération aléatoire" (Use constraint on randomization) dans les paramètres.
- **Sélection des sets** : Pour chaque extension, vous pouvez cocher la case d'activation afin d'éditer ses contraintes spécifiques de répartition et d'exclusion.

---
## 2. Définition des Min/Max par Extension

Pour chaque extension activée, vous pouvez configurer :
- **Nombre Minimum (nb min)** : Force l'algorithme à inclure au moins ce nombre de cartes de cette extension dans le deck généré (ex: forcer la présence d'au moins 2 cartes de *Seaside*).
- **Nombre Maximum (nb max)** : Limite le nombre de cartes de cette extension à cette valeur maximale dans le deck généré (ex: pas plus de 4 cartes d'un même set pour favoriser la diversité).

> [!IMPORTANT]
> - La somme de tous les minimums configurés ne doit pas dépasser 10 (le nombre standard de cartes Royaume dans un deck). Si cette somme dépasse 10, l'algorithme ignore temporairement les minimums pour éviter un blocage.
> - L'application valide et ajuste automatiquement vos saisies en temps réel pour empêcher des configurations impossibles (par exemple, saisir un minimum supérieur au maximum).

---
## 3. Exclusion de Cartes Spécifiques (Liste Noire)

Si vous n'appréciez pas certaines cartes, ou si vous souhaitez les écarter de vos tirages :
- **Sélection des cartes à exclure** : Un menu déroulant pour chaque extension vous permet de sélectionner individuellement les cartes à écarter.
- **Effet sur le tirage** : Toutes les cartes cochées sont exclues de la génération et n'apparaîtront pas dans le deck final.

---
## 4. Fonctionnement de l'Algorithme de Répartition

Lors de la génération aléatoire d'un deck (Kingdom), l'algorithme procède comme suit :
1. **Exclusion** : Les cartes placées en liste noire (exclues) sont immédiatement retirées du vivier de cartes disponibles.
2. **Pré-allocation des Minima** : L'algorithme réserve des places dans le deck pour satisfaire le nombre minimum de cartes requis pour chaque extension configurée.
3. **Distribution du reste** : Les places restantes (pour compléter le deck à 10 cartes Royaume) sont réparties de manière aléatoire entre les extensions éligibles, en veillant à ne pas dépasser la limite maximale définie pour chacune d'elles.
