## KingdomCreator
###### based on Dominion Randomizer (aka Kingdom Creator) from Blakevanlan
###### reworked by gillesgros

Hosted at https://www.dominionrandomizer.com 
It is a kingdom randomizer, or card picker, for Dominion.

Feel free to propose any improvements you see fit and send me a pull request!

### Changelog
2024/10/21 - 6.4.0
Dev deploy on github pages
  Feat - include RisingSun and prophecies
  Feat - add option to exclude cards from randomization
  Fix & Feat (see [Changelog.md](./Changelog.md))
  
2024/09/24 - 6.3.1
New Release
  Fix blakevanlan/KingdomCreator # 169 - Bug: Copy does not work anymore like it used to
  
2024/09/23 - 6.3.0
New Release
  Fix & Feat (see [Changelog.md](./Changelog.md))
  
2024/07/10 - 6.2.0
New release
  Fixing enlargde display for Addons, Boons, Allies

2024/07/08 - 6.1.0
New release
  Fixing boon display

2024/07/04 - 6.1.0
New release
  add German rules and box
  add menu for new set tools
## Development
it uses vue 3, vite.js, Pinia, vue-i18n and node.js v20

##### Rendering
This is a static site.
https://www.dominionrandomizer.com : served through GitHub Pages and deployed at each commit. Check the `/docs` directory in **master** to see the source currently being served.


##### Commands
`npm run Gen` - build translation file locate at src/i18n/locales/messages/{lang}
                based on the translation maintained in `/process/ressources`
                Run the development server with hot reloading 
`npm run dev` - Run the development server with hot reloading 

`npm run build` - Builds the static site and outputs the assets in `/docs`

`npm run preview` - Serves the build assets from `/docs` in case you want to check the built version

## Updates based on Dominion Expansion evolutions
Following new updates on http://wiki.dominionstrategy.com some adjustements need to be made.
Work in Progress can be seen at https://71yeti.fr served at through a personal site.

### To add a new set
#### build set file
The first step is to create the "setname".yaml file based on models located at `/sets`
Remember that entries with false are nonmandatory.
Add all cards to allow correct box content display

#### get images
To get images from dominionstrategy.com
> - Add a type if needed. You will need to code a bit.
>   This might occur in file `./process/Get_CardImage_linkForAtrwork_Illustrator.js`
>   in function: `getCards()
>   and in file `./process/resize.js`
>   in function: `isHorizontal()`

You will be guided thru the type of info, the set and cards selection.

to execute `cd process` run `node Get_CardImage_linkForAtrwork_Illustrator.js`
Images will be created for english version at `process/processed/docs/img/cards/setname`
You will need to move them to `/docs/img/cards/setname`

#### add translations
if the file `process\ressources\Pages.xlsx` add all the entries for the cards to translate.

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


### Usefull Personnal full set-up

##### npm-check-updates 
to upgrades your package.json dependencies to the latest versions, ignoring specified versions.
`npm install -global npm-check-updates`