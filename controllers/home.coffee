express = require 'express'
creator = require '../utils/creator'
Sets = require '../models/set'
path = require 'path'
fs = require 'fs'
yaml = require 'js-yaml'

module.exports = app = express()

# Read the sets.
sets = {}
setFiles = fs.readdirSync(path.join(__dirname, '../sets')
for setFile in setFiles
   id = path.basename(setFile, '.yaml')
   sets[id] = yaml.safeLoad(fs.readFileSync(setFile, 'utf8'))

app.get '/', (req, res, next) ->   
   res.render 'home', sets: sets

app.get '/cards/kingdom', (req, res) ->
   setIds = req.query.sets?.split(',')
   replaceCards = req.query.replaceCards?.split(',')
   keepCards = req.query.keepCards?.split(',')
   types = req.query.types?.split(',')
   creator.createKingdom setIds, replaceCards, keepCards, types, (err, kingdom) ->
      res.json kingdom.toObject()
