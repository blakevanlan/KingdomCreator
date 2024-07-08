## Vite-KingdomCreator-New
###### based on Dominion Randomizer (aka Kingdom Creator) from Blakevanlan
###### reworked by gillesgros

Originately hosted at https://71yeti.fr.
It is a kingdom randomizer, or card picker, for Dominion.
As I became a maintainer for Kingdom Creator, https://www.dominionrandomizer.com might be at the same level.

Feel free to propose any improvements you see fit and send me a pull request!

## Development
it uses vue 3, vite.js, Pinia, vue-i18n and node.js v20

##### Rendering
This is a static site.
https://www.dominionrandomizer.com : served through GitHub Pages and deployed at each commit. Check the `/docs` directory in **master** to see the source currently being served.
https://71yeti.fr: served at through my personal site. Check the `/docs` directory in **master** to see the source served.

##### Commands
 npm run Gen  - build translation file locate at src/i18n/locales/messages/{lang} based on the translation maintained in 
                Run the development server with hot reloading 
`npm run dev` - Run the development server with hot reloading 

`npm run build` - Builds the static site and outputs the assets in `/docs`

`npm run preview` - Serves the build assets from `/docs` in case you want to check the built version

## Updates based on Dominion Expansion evolutions
Following new updates on http://wiki.dominionstrategy.com some adjustements need to be made.

### To add a new set
#### build set file
The first step is to create the "setname".yaml file based on models located at `/sets`
Remember that entries with false are nonmandatory.
Add all cards to allow correct box content display

#### get images
To get images from dominionstrategy.com
 - Add a type if needed. You will need to code a bit.
   This might occur in file `./process/get_ CardImage_linkForAtrwork_Illustrator.js`
   in function: getCards()
   and in file `./process/resize.js`
   in function: isHorizontal()

You will be guided thru the type of info, the set and cards selection.

to execute `cd process` run `node get_ CardImage_linkForAtrwork_Illustrator.js`
Images will be created for english version at `process/processed/docs/img/cards/setname`
You will need to move them to `/public/img/cards/setname`

#### add translations
if the file `process\ressources\Pages.xlsx` add all the netries for the cards to translate.

The Cards translation generation is included in `npm run Gen` command

The translataion source is Pages.xlsx for all the expansions.
it generates a csv file: `./resources/pages.csv` in `process` folder
It will create for each language defined at line 2 of page.csv, files in 
`./src/i18n/messages/${lang}` for dominionrandomizer pages and
a file per set in `./src/i18n/messages/${lang}/cards` with card name translation for this set.

The feature can be use standalone with `cd process` and run `node Build-translation-pages.js`
the generated files will be located in `/process/processed/src/i18n/messages/${lang}` for dominionrandomizer pages and
a file per set in `/process/processed/src/i18n/messages/${lang}/cards` with card name translation for this set.

#### Build kingdoms
To build kingdom file related to an expansion use
`cd process` run `node GenerateKigndom.js`
with in file GenerateKigndom.js
add the string variable contaning the kingdom list 
example : 
```
Kingdoms["alchemy"] = [
  "Forbidden Arts: Apprentice, Familiar, Possession, University, Cellar, Council Room, Gardens, Laboratory, Thief, Throne Room",
  ...
  "Pools, Tools, and Fools: Apothecary, Apprentice, Golem, Scrying Pool, Baron, Coppersmith, Ironworks, Nobles, Trading Post,  Wishing Well",
];
strings = ["Introduction: Cartographer, Crossroads, Develop, Jack of all Trades, Margrave, Nomads, Oasis, Spice Merchant, Stables, Weaver"]
```


### Old features - stil uselful ?

##### Docker Container - This was possible with webpack serving. It should still be working.
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


### Personnal full set-up

##### npm-check-updates 
to upgrades your package.json dependencies to the latest versions, ignoring specified versions.
`npm install -global npm-check-updates`