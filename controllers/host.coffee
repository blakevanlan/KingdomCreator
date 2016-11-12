express = require('express')
path = require('path')
compression = require('compression')

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

# Controllers
app.use(require("./home"))

# Serve the images.
app.use(express.static(path.join(__dirname, "../docs")))