# Dominion Randomizer (aka Kingdom Creator)

https://www.dominionrandomizer.com is a kingdom randomizer, or card picker, for Dominion.

Feel free to make any improvements you see fit and send me a pull request!

## Development
This is a static site served through GitHub Pages. Check the `/docs` directory in `master` to see the source currently being served at http://www.dominionrandomizer.com.

### Commands

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