# Dominion Randomizer (aka Kingdom Creator)

https://www.dominionrandomizer.com is a kingdom randomizer, or card picker, for Dominion.

Feel free to make any improvements you see fit and send me a pull request!

## Development
This is a static site served through GitHub Pages. Check the `/docs` directory in `master` to see the source currently being served at http://www.dominionrandomizer.com.

### Commands


set PATH=%PATH%;"e:\Users\Gilles\Carte 32 Go\# Portable App\NodeJSPortable -v12.14.1"
set PATH=%PATH%;"e:\Users\Gilles\Carte 32 Go\# Portable App\node-v16.15.1-win-x64"

`npm start` - Run the development server with hot reloading at `localhost:8080`

`npm run build` - Builds the static site and outputs the assets in `/docs`

`npm run serve-static` - Serves the build assets from `/docs` in case you want to check the built version

### Docker Container

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

### To add a new set

to get images from dominionstrategy.com

add type if needed. You will need to code a bit
run either from directory "./process" : 
`node download.js`
but you will need to create some directories
or run it from kingdom_creator root directory : 
`node process/download.js`
Images will be created for english version.

to build kingdom file related to an expansion use
`coffee kigndom.coffee`
with in file kingdom.coffee
string variable set with kingdom list 
strings = ["Introduction: Cartographer, Crossroads, Develop, Jack of all Trades, Margrave, Nomads, Oasis, Spice Merchant, Stables, Weaver"]


to translate cards in process directory 
Use `node extract-card-names-concat.js`
to create `src\i18n\messages\cards.{lang}.json` with card name translation
The source is 1 file for each expansion
pattern is `./process/resources/cards_translations - {expansion}.csv`

to translate cards in process directory 
Use `node extract-card-names.js`
to create `src\i18n\messages\cards.{lang}.json` with card name translation
The source is 1 file for all the expansions
patern is `./process/resources/cards_translations.csv`

to translate set name in process directory 
Use `node extract-set-names.js`
to create `src\i18n\messages\sets.{lang}.json` with card name translation
The source is 1 file for all the expansions
patern is `./process/resources/sets_name.csv`