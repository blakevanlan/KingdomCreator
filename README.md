## Vite-KingdomCreator-New
###### based on Dominion Randomizer (aka Kingdom Creator) from Blakevanlan
###### reworked by gillesgros

Originately hosted at https://71yeti.fr.
It is a kingdom randomizer, or card picker, for Dominion.
As I became a maintainer for Kingdom Creator, https://www.dominionrandomizer.com might be at the same level.

Feel free to make any improvements you see fit and send me a pull request!

## Development
it uses vue 3, vite.js, Pinia, vue-i18n and node.js v20

This is a static site served through GitHub Pages. Check the `/docs` directory in `master` to see the source currently being served at https://71yeti.fr


##### Commands
`npm run dev` - Run the development server with hot reloading at `localhost:8080`

`npm run build` - Builds the static site and outputs the assets in `/docs`

`npm run preview` - Serves the build assets from `/docs` in case you want to check the built version

#### Docker Container

Dominion Randomizer can also be served from a Docker container with the
following commands:

```shell
# Build the site
$ npm run build

# Build the Docker image
$ sudo docker build --tag "kingdom_creator:latest" .

# Start a container from the built image. This will be published on local port
# 9999, but that can be changed as needed.
$ sudo docker run \
    --detach \
    --name="kingdom_creator" \
    --publish="9999:80" \
    --volume="$(pwd)/docs://usr/share/nginx/html:ro" \
    "kingdom_creator:latest"
```

###### To add a new set

to get images from dominionstrategy.com
 - Add a type if needed. You will need to code a bit.
   This might occur in file `./process/download.js`

you need to set in `download.js` the type of image card or ste you want to get
this is here in term of code

    //processAllSets();  // to process all known sets
    //getAllImages(getCards(sets.plunder)); // to process 1 set 
    getImage(sets.plunder.cards.filter(card => card.name == "Cage")[0]) // to process 1 card

to execute 
    `cd process`
run `node download.js`
Images will be created for english version.

to build kingdom file related to an expansion use
`coffee kigndom.coffee`
with in file kingdom.coffee
string variable set with kingdom list 
strings = ["Introduction: Cartographer, Crossroads, Develop, Jack of all Trades, Margrave, Nomads, Oasis, Spice Merchant, Stables, Weaver"]

###### Cards translation generation
functionnality included in `npm run Gen`
== Active ==
to generate new translation files in process directory 
`cd process`
Use `node Build-translation-pages.js`
The source is 1 file for all the expansions
patern is `./resources/pages.csv` in `process` folder
It will create for each language defined at line 2 of page.csv, files in 
`./processed/src/i18n/messages/${lang}` for dominionrandomizer pages and
a file per set in `./processed/src/i18n/messages/${lang}/cards` with card name translation for this set.

To use copy folder form `./processed` to root directory

== Deprecated ==
to translate cards in process directory 
Use `node extract-card-names.js`
to create `src\i18n\messages\cards.${lang}.json` with card name translation
The source is 1 file for all the expansions
patern is `./process/resources/cards_translations.csv`

== Deprecated ==
to translate cards in process directory 
Use `node extract-card-names-concat.js`
to create `src\i18n\messages\cards.${lang}.json` with card name translation
The source is 1 file for each expansion
pattern is `./process/resources/cards_translations - ${expansion}.csv`

== Deprecated ==
to translate set name in process directory 
Use `node extract-set-names.js`
to create `src\i18n\messages\sets.{lang}.json` with card name translation
The source is 1 file for all the expansions
patern is `./process/resources/sets_name.csv`


### Personnal full set-up

# Install globally to execute .coffee files anywhere:
npm install --global coffeescript
# npm-check-updates upgrades your package.json dependencies to the latest versions, ignoring specified versions.
npm install -global npm-check-updates