express = require 'express'
creator = require '../utils/creator'
Sets = require '../models/set'

module.exports = app = express()

app.get '/', (req, res, next) ->
   Sets.find({ inactive: { $ne: true }}).sort('_id').lean().exec (err, sets) ->
      return next(err) if err
      res.render 'home', sets: sets

app.get '/cards/kingdom', (req, res) ->
   setIds = req.query.sets?.split(',')
   creator.createKingdom setIds, (err, kingdom) ->
      res.json kingdom.toObject()

app.get '/cards/single', (req, res) ->
   setIds = req.query.sets?.split(',')
   cardIds = req.query.cards?.split(',')
   types = req.query.types?.split(',')

   creator.singleCard setIds, cardIds, types, (err, card) ->
      res.json card
