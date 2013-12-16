express = require 'express'
async = require 'async'
Cards = require '../models/card'
Sets = require '../models/set'
mongoose = require('mongoose')

module.exports = app = express()

app.get '/', (req, res, next) ->
   Sets.find().lean().exec (err, sets) ->
      return next(err) if err
      res.render 'home', sets: sets

app.get '/randomCards', (req, res) ->
   cards = req.query.cards?.split(',')
   sets = req.query.sets?.split(',')

   if sets and sets.length > 0
      for set, index in sets
         sets[index] = mongoose.Types.ObjectId(set)
      filter = { set: { $in: sets } }
   else filter = {}

   # Set up what tasks need to be executed
   tasks =
      count: (done) -> Cards.count(filter).exec(done)
   
   if cards
      tasks.cards = (done) -> Cards.find( _id: { $in: cards }).lean().exec(done)

   async.parallel tasks, (err, results) ->
      return next(err) if err
      return res.json { err: 'Invalid set(s)'} if results.count < 10
      
      cards = [] unless cards
      q = async.queue (index, callback) ->
         getCard index, filter, (err, card) ->
            cards.push(card) if card
            callback(err)
      , 10
      
      indexes = getRandomInts(10 - cards?.length or 0, results.count)
      q.push(index) for index in indexes
      q.drain = (err) ->
         # Sort cards by name
         cards.sort (a, b) ->
            return -1 if a.set < b.set
            return 1 if a.set > b.set
            return -1 if a.name < b.name
            return 1 if a.name > b.name
            return 0

         res.json cards


getRandomInt = (min, max) ->
   return Math.floor(Math.random() * (max - min) + min)
   
inList = (val, list) ->
   for i in list
      if i == val
         return true
   return false

getRandomInts = (count, max) ->
   nums = []
   while nums.length < count
      while true
         num = getRandomInt(0, max)
         if not inList(num, nums)
            nums.push(num)
            break
   return nums

getCard = (index, filter, cb) ->
   Cards.find(filter).lean().limit(1).skip(index).exec (err, cards) ->
      return cb(err) if err
      cb(null, cards[0])
