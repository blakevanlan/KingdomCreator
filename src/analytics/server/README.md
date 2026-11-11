# Suivi d’usage du Dominion Randomizer

## Installation

Copier `index.html` et `server.php` dans le répertoire web de `suivi.71yeti.fr`.
Le serveur doit disposer de PHP avec PDO SQLite (`pdo_sqlite`) et pouvoir créer
un répertoire `databases` accessible en écriture à côté de `server.php`.

Configurer une variable d’environnement serveur `ANALYTICS_DASHBOARD_TOKEN` avec
un jeton administrateur long et aléatoire. Si l’hébergeur ne permet pas de
configurer une variable d’environnement, créer sur le serveur (sans l’ajouter au
dépôt) un fichier `server-config.php` à côté de `server.php` :

```php
<?php
return ['dashboardToken' => 'REMPLACER_PAR_UN_JETON_LONG_ET_ALEATOIRE'];
```

Le jeton protège la lecture des statistiques et des journaux ; il n’est jamais
inclus dans les événements. Sans jeton configuré, l’écriture des événements
fonctionne, mais les lectures du tableau de bord renvoient une erreur.

Ouvrir `https://suivi.71yeti.fr/` pour le tableau de bord, sélectionner la source
du site et saisir le jeton. Les données brutes s’affichent d’abord avec un filtre
par `EventType` et une pagination ; la vue analytique est présentée en dessous.
Les colonnes des tableaux de données brutes et des royaumes récents sont
redimensionnables ; leurs largeurs sont conservées dans le navigateur.

## Gestion des données

Depuis la section des données brutes, les actions de maintenance permettent :

- de vider tous les événements de la base sélectionnée, sans supprimer le fichier
  SQLite ni sa table ;
- de supprimer les événements datés du jour choisi ou d’un jour antérieur ;
- de filtrer les journaux par `EventType`, identifiant de session exact et texte
  présent dans les paramètres JSON, puis de sélectionner et supprimer des lignes.
  La sélection est conservée entre les pages, effacée lorsque les critères
  changent et limitée à 1 000 lignes par opération. Le nombre de résultats par
  page peut être réglé sur 50, 100, 250, 500 ou 1 000.

La liste « Cartes et addons les plus utilisés » est distribuée en quatre colonnes
sur grand écran, deux sur écran moyen et une sur mobile.

Chaque suppression requiert une confirmation dans l’interface et le jeton
administrateur. Les événements reçus pendant une suppression restent soumis au
fonctionnement normal de l’écriture.

## Vérifier la réception des événements

Après avoir déployé la version de l’application qui contient le suivi, générer
un royaume puis consulter la liste des sources du
tableau de bord. Une source n’est créée qu’à la première écriture. Si elle reste
absente, ouvrir les outils développeur du navigateur, onglet **Réseau**, et
repérer le POST vers `server.php?source=...` :

- `200` : l’événement a été enregistré ;
- `400` ou `413` : consulter le corps de la réponse dans la console ;
- erreur réseau/CORS : vérifier les en-têtes et redirections de l’hébergement ;
- `500` : vérifier les journaux d’erreur PHP et la disponibilité de PDO SQLite
  ainsi que les droits d’écriture du répertoire `databases`.

Le navigateur affiche désormais le code HTTP et le corps d’une réponse en erreur.
Le serveur journalise le détail des erreurs SQLite/PDO dans les logs PHP de
l’hébergement.

## Données collectées

Les appels `trackEvent` et `trackError` enregistrent individuellement leur
`EventType` et leur catégorie (`event` ou `error`). Cela inclut les actions de
randomisation, les chargements depuis URL et `UPDATE_KINGDOM`. Ce dernier est
envoyé à chaque mise à jour, avec sa provenance. Ces événements rendent les
actions visibles dans les données brutes et le filtre `EventType`.
Deux envois consécutifs identiques (même catégorie, même `EventType` et mêmes
paramètres) ne produisent qu’une seule requête. L’ordre des propriétés d’un
objet n’affecte pas cette comparaison ; un autre événement entre les deux
réinitialise la déduplication. La signature est conservée dans le stockage de
session du navigateur afin que la protection survive au rechargement du même
onglet.
Les événements de randomisation incluent `selectedSets`, toutes les valeurs de
`randomizerSettings` et les détails utiles de `applicationSettings`.
`configurationAdjusted` vaut `true` uniquement si la taille personnalisée ou
les contraintes de randomisation sont activées ; `adjustedElements` identifie
les réglages concernés et les contraintes actives sont détaillées par set.
`configurationSimplified` signale séparément l’option « extensions possédées
uniquement ». Les options de `randomizerSettings` sont conservées pour les
statistiques, mais ne marquent pas la configuration comme ajustée. Le champ
`googleDriveConnected` indique uniquement si l’accès à Google Drive est vérifié
et son jeton encore valide au moment de la randomisation ; aucun jeton ni
identifiant de compte n’est transmis.
Chaque page suivie possède son événement dédié : `RANDOMIZER_VIEW`,
`RULEBOOK_VIEW`, `SEARCH_CARDS_VIEW`, `CARDS_VIEW`, `SETTINGS_VIEW`,
`HELP_VIEW` et `HISTORY_VIEW`. Les ouvertures et changements de set dans Boxes
utilisent `BOXE_VIEW`, et ceux dans Sets utilisent `SET_VIEW`, chacun avec
l’identifiant du set consulté. `RULEBOOK_VIEW` inclut la langue affichée.
`PAGE_VIEW` n’est plus envoyé par la nouvelle version, mais reste pris en charge
pour afficher les anciennes données. Les anciens `PAGE_VIEW` de Boxes et Sets
sont reclassés dans les statistiques de sets consultés, pas dans les pages
générales. Aucun paramètre d’URL n’est envoyé.
Le clic sur le bouton d’ouverture des nouveautés est enregistré avec
`NEWS_MODAL_OPEN`.
Lorsque Google Drive est connecté, le clic sur « Joué » est enregistré avec
`MARK_KINGDOM_PLAYED`, et le clic sur « Rejouer » dans l’historique avec
`HISTORY_KINGDOM_REPLAY`. Ces événements ne contiennent pas l’identifiant du
royaume.

En complément, chaque royaume affiché ou modifié enregistre un événement
`KINGDOM_ACTIVITY` contenant :

- les identifiants des cartes, addons et cartes spéciales du royaume ;
- les extensions sélectionnées et l’option de tri ;
- les options du randomizer et les réglages généraux, dont contraintes et
  extensions possédées ;
- l’origine (`random`, `randomize_partial`, `edit`, `shared_url`,
  `shared_url_partial` ou `play_again`).

L’origine `play_again` correspond précisément à l’action « Play Again ».
Aucun hash, URL, nom, adresse e-mail, identifiant de compte ou donnée Google
n’est envoyé. Une mise à jour crée donc un `UPDATE_KINGDOM` et un
`KINGDOM_ACTIVITY`, en plus de l’événement de randomisation associé, le cas
échéant.

Les appels d’écriture ajoutent un `sessionId` unique par onglet, conservé pendant
les rechargements de cet onglet. Le tableau des données brutes permet de filtrer
et regrouper les événements par cet identifiant. Les anciennes lignes restent
consultables sans identifiant de session. La section analytique calcule également les pages et sets consultés, les langues
des règles, les clics suivis, les erreurs, les types de randomisation, leurs sets,
leurs réglages et l’état de connexion Google Drive. Les randomisations sont
comptées à partir des événements de catégorie `event`, et non des erreurs.
`KINGDOM_ACTIVITY` est désormais envoyé à chaque mise à jour de royaume avec sa
provenance et sa configuration. Pour les bases plus anciennes sans cet
événement, les cartes, royaumes récents et sets utilisés sont reconstruits à
partir des événements `UPDATE_KINGDOM` et des métadonnées de randomisation déjà
enregistrés ; la provenance historique reste indiquée comme inconnue.
Le contexte client est envoyé séparément des paramètres d’événement et stocké
dans la colonne `clientContext` de `RequestLog`. Il conserve les valeurs de
navigateur (`browser`) et d’appareil (`device`: `desktop`, `mobile` ou `tablet`),
ainsi que le pays (`country`) calculé par le serveur. Dans le tableau de bord,
seuls le pays et le type d’appareil sont affichés comme colonnes ; le contexte
complet reste dans la base et dans la réponse JSON protégée des journaux.

Le serveur utilise l’adresse `REMOTE_ADDR` fournie par PHP pour rechercher le
code pays dans la base locale GeoLite2 Country, placée dans
`../../geoip-reader/GeoLite2-Country.mmdb` par rapport au dossier de `server.php`.
Le lecteur Composer est chargé depuis `../../geoip-reader/vendor/autoload.php`.
Ces fichiers restent ainsi hors du dossier public. L’adresse IP n’est pas
ajoutée aux paramètres ni au contexte stocké. Si l’adresse n’est pas reconnue,
le code est `unknown`. Si les fichiers GeoIP sont manquants ou illisibles, l’API
renvoie une erreur et journalise le problème côté PHP.

L’attribution requise par GeoLite est affichée dans le tableau de bord : « This
product includes GeoLite Data created by MaxMind ». Les événements déjà
enregistrés avant l’activation de cette recherche peuvent encore contenir le
champ `ip` ; ils doivent être supprimés si vous ne souhaitez plus conserver ces
adresses. Les données brutes exposent l’ensemble des `EventType`.
