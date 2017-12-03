express = require('express')
path = require('path')
compression = require('compression')
Loader = require('../utils/loader')

app = module.exports = express()

# Settings
app.set("view engine", "pug")
app.set("view options", {layout: false})
app.set("views", path.join(__dirname, "../views"))

app.configure "development", () ->
   app.use(express.logger("dev"))
   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))

app.configure "production", () ->
   app.use(express.errorHandler())

# Middleware
app.use(compression())
app.use(express.query())
app.use(express.bodyParser())
app.use(require("connect-assets")())

# Read the sets.
console.log("Loading sets...")
sets = Loader.loadSets()
console.log("Finished loading sets.")

console.log("Loading kingdoms...")
kingdoms = Loader.loadKingdoms()
console.log("Finished loading kingdoms.")

# Controllers for URLs.
renderParams = {sets: sets, kingdoms: kingdoms, isProduction: false}

app.get '/', (req, res, next) ->  res.render('index', renderParams)
app.get '/index.html', (req, res, next) ->  res.render('index', renderParams)
app.get '/sets.html', (req, res, next) ->  res.render('sets', renderParams)


# Serve the images.
app.use(express.static(path.join(__dirname, "../docs")))

