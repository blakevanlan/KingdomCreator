express = require 'express'
async = require 'async'
Cards = require '../models/card'
Sets = require '../models/set'
mongoose = require('mongoose')

ALCHEMY_SET_ID = '52ae7d481f29ce019a0001f6'

module.exports = app = express()

app.get '/', (req, res, next) ->
   Sets.find({ inactive: { $ne: true }}).sort('_id').lean().exec (err, sets) ->
      return next(err) if err
      res.render 'home', sets: sets

app.get '/randomCards', (req, res) ->
   keepCards = req.query.cards?.split(',')
   sets = req.query.sets?.split(',')
   skipAlchemy = getRandomInt(0, 3) #(sets?.length or 2))
   
   if sets and sets.length > 0
      # Remove alchemy from set selection
      if skipAlchemy and sets.length > 2
         temp = (s for s in sets when s != ALCHEMY_SET_ID)
         sets = temp

      for set, index in sets
         sets[index] = mongoose.Types.ObjectId(set) 
      
      filter = { set: { $in: sets } }
   else filter = {}

   if keepCards and keepCards.length > 0
      for keepCard, index in keepCards
         keepCards[index] = mongoose.Types.ObjectId(keepCard)
      filter._id = { $nin: keepCards }

   respond = (err, keptCards) ->
      return next(err) if err
      getCards (10 - (keptCards?.length or 0)), filter, (err, cards) ->
         return next(err) if err
         cards.push(c) for c in keptCards if keptCards?.length > 0
         alchemySetFix cards, (err, cards) ->
            return next(err) if err
            cards.sort cardSorter
            res.json cards

   if keepCards
      Cards.find( _id: { $in: keepCards }).lean().exec(respond)
   else
      respond()

alchemySetFix = (cards, cb) ->
   alchemyCards = (c for c in cards when c.set.toString() == ALCHEMY_SET_ID)
   # Return if there are either more than 3 alchemy cards or none
   return cb(null, cards) unless 0 < alchemyCards.length < 3
   numNewCards = getRandomInt(3, 6) - alchemyCards.length
   
   filter = 
      set: mongoose.Types.ObjectId(ALCHEMY_SET_ID)
      _id: { $nin: (c._id for c in alchemyCards) }

   getCards numNewCards, filter, (err, newCards) ->
      nonAlchemyCards = (c for c in cards when c.set.toString() != ALCHEMY_SET_ID)
      indexes = getRandomInts(numNewCards, nonAlchemyCards.length)
      nonAlchemyCards[indexes[index]] = card for card, index in newCards
      nonAlchemyCards.push(card) for card in alchemyCards
      cb(null, nonAlchemyCards)

cardSorter = (a, b) ->
   return -1 if a.set < b.set
   return 1 if a.set > b.set
   return -1 if a.name < b.name
   return 1 if a.name > b.name
   return 0

getCards = (count, filter, cb) ->
   cards = []
   Cards.count(filter).exec (err, cardCount) ->
      return cb(err) if err
      q = async.queue (index, callback) ->
         getCard index, filter, (err, card) ->
            cards.push(card) if card
            callback(err)
      , 10
         
      indexes = getRandomInts(count, cardCount)
      q.push(index) for index in indexes
      q.drain = (err) -> 
         cb(err, cards)

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
