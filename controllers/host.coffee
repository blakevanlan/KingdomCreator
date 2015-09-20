express = require 'express'
path = require 'path'
mongoose = require 'mongoose'

mongoose.connect(process.env.MONGO_URL)

app = module.exports = express()

# Settings
app.set "view engine", "jade"
app.set "view options", layout: false
app.set "views", path.join __dirname, "../views"

app.configure "development", () ->
   app.use express.logger "dev"
   app.use express.errorHandler { dumpExceptions: true, showStack: true }

app.configure "production", () ->
   app.use express.errorHandler()

# Middleware
app.use express.query()
app.use express.bodyParser()
app.use require("connect-assets")()
app.use express.static(path.join(__dirname, "../public"))

# Controllers
app.use require "./home"