express = require 'express'
path = require 'path'
# passport = require 'passport'
# LocalStrategy = require('passport-local').Strategy
mongoose = require 'mongoose'

mongoose.connect(process.env.MONGO_URL || "mongodb://admin:2a55de6e9a838dbce2a644ef7e@dharma.mongohq.com:10001/dominion")

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

# Passport setup
# passport.serializeUser (user, done) -> done(null, JSON.stringify(user))
# passport.deserializeUser (user, done) -> done(null, JSON.parse(user))
# passport.use(new LocalStrategy(
#    (username, password, done) ->
#       if (password == (process.env.ADMIN_PASSWORD or 'something'))
#          return done(null, {});
#       else
#          return done(null, false, { message: 'Incorrect password.' })
# ))

# Middleware
app.use express.query()
app.use express.bodyParser()
app.use express.cookieParser()
app.use require("connect-assets")()
app.use express.static(path.join(__dirname, "../public"))
# app.use express.session({ secret: 'yo, yo its secret' })
# app.use passport.initialize()
# app.use passport.session()

# Controllers
app.use require "./home"