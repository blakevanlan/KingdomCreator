async = require 'async'
Cards = require '../models/card'
Sets = require '../models/set'
mongoose = require 'mongoose'
rand = require './rand'
Kingdom = require './Kingdom'

ALCHEMY_SET_ID = '52ae7d481f29ce019a0001f6'

module.exports =
   createKingdom: (sets, callback) ->
      skipAlchemy = rand.getRandomInt(0, 3)

      if sets and sets.length > 0
         # Remove alchemy from set selection
         if skipAlchemy and sets.length > 2
            temp = (s for s in sets when s != ALCHEMY_SET_ID)
            sets = temp

         for set, index in sets
            sets[index] = mongoose.Types.ObjectId(set) 
      
         filter = { set: { $in: sets } }
      else filter = {}

      async.waterfall [
         (cb) -> cb(null, new Kingdom(null, filter)),
         fillKingdom,
         alchemySetCorrection,
      ], callback
      
   singleCard: (sets, avoidCardIds, types, callback) ->
      filter = { 
         set: { $in: sets }
         _id: { $nin: avoidCardIds }
      }
      appendTypesToFilter(types, filter) if types
      
      getCards 1, filter, (err, cards) ->
         return callback(err) if err
         if cards?.length > 0 then callback(null, cards[0])
         else
            # If we didn't find an available card then remove the types filter
            # and try again
            delete filter['$or']
            getCards 1, filter, (err, cards) ->
               return callback(err) if err
               callback(null, cards[0])
###
# Kingdom middleware
###
fillKingdom = (kingdom, callback) ->
   getCards (10 - kingdom.cards?.length or 0), kingdom.filter, (err, cards) ->
      return next(err) if err
      kingdom.cards.push(card) for card in cards
      callback(null, kingdom)
      
alchemySetCorrection = (kingdom, callback) ->
   alchemyCards = (c for c in kingdom.cards when c.set.toString() == ALCHEMY_SET_ID)
   # Return if there are either more than 3 alchemy cards or none
   return callback(null, kingdom) unless 0 < alchemyCards.length < 3
   numNewCards = rand.getRandomInt(3, 6) - alchemyCards.length
   
   filter = 
      set: mongoose.Types.ObjectId(ALCHEMY_SET_ID)
      _id: { $nin: (c._id for c in alchemyCards) }

   getCards numNewCards, filter, (err, newCards) ->
      nonAlchemyCards = (c for c in kingdom.cards when c.set.toString() != ALCHEMY_SET_ID)
      indexes = rand.getRandomInts(numNewCards, nonAlchemyCards.length)
      nonAlchemyCards[indexes[index]] = card for card, index in newCards
      nonAlchemyCards.push(card) for card in alchemyCards
      kingdom.cards = nonAlchemyCards
      callback(null, kingdom)

###
# Utilities
###
getCards = (count, filter, cb) ->
   cards = []
   Cards.count(filter).exec (err, cardCount) ->
      return cb(err) if err
      q = async.queue (index, callback) ->
         getCardFromIndex index, filter, (err, card) ->
            cards.push(card) if card
            callback(err)
      , 10
         
      indexes = rand.getRandomInts(count, cardCount)
      q.push(index) for index in indexes
      q.drain = (err) -> 
         cb(err, cards)


getCardFromIndex = (index, filter, cb) ->
   Cards.find(filter).lean().sort('_id').limit(1).skip(index).exec (err, cards) ->
      return cb(err) if err
      cb(null, cards[0])


appendTypesToFilter = (types, filter) ->
   map = 
      '+2actions': 'isActionSupplier'
      'attack': 'isAttack'
      '+1buy': 'isBuySupplier'
      'duration': 'isDuration'
      'reaction': 'isReaction'
      'trashing': 'isTrashing'
      'victory': 'isVictory'

   filter['$or'] = []
   for type in types
      continue unless map[type]
      sub = {}
      sub[map[type]] = true
      filter['$or'].push(sub)   

   return filter




