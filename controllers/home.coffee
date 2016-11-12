express = require('express')
setLoader = require('../utils/set-loader')

module.exports = app = express()

# Read the sets.
console.log("Loading sets...")
sets = setLoader.loadSets()
console.log("Finished loading sets.")

app.get '/', (req, res, next) ->   
   res.render('home', {sets: sets, isProduction: process.env.NODE_ENV == 'production'})
