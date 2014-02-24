async = require 'async'
Cards = require '../models/card'
Sets = require '../models/set'
mongoose = require 'mongoose'
rand = require './rand'
Kingdom = require './Kingdom'

ALCHEMY_SET_ID = '52ae7d481f29ce019a0001f6'

module.exports =
   createKingdom: (sets, replaceCards, keepCards, types, callback) ->
      if sets?.length > 0
         sets[index] = mongoose.Types.ObjectId(set) for set, index in sets
         filter = { set: { $in: sets } }
      else filter = {}

      kingdom = new Kingdom(null, filter)
      kingdom.replaceCards = replaceCards if replaceCards?.length > 0
      kingdom.keepCards = keepCards if keepCards?.length > 0
      kingdom.types = types if types?.length > 0
      startWaterfall = (cb) -> cb(null, kingdom)

      async.waterfall [
         startWaterfall,
         loadKeepCards,
         setTypesOnFilter,
         fillKingdom,
         alchemySetCorrection,
         actionSupplierCorrection
      ], callback
      
###
# Kingdom middleware
###

loadKeepCards = (kingdom, callback) ->
   # Return right away if there are no keepCards
   if not kingdom.keepCards or kingdom.keepCards.length == 0
      return callback(null, kingdom)

   # Update keepCards entries to be ObjectIds instead of strings
   for id, index in kingdom.keepCards
      kingdom.keepCards[index] = mongoose.Types.ObjectId(id)
   
   Cards.find({_id: { $in: kingdom.keepCards }}).lean().exec (err, cards) ->
      return callback(err) if err
      kingdom.cards.push(card) for card in cards
      callback(null, kingdom)
   
setTypesOnFilter = (kingdom, callback) ->
   # Return right away if there are no types
   return callback(null, kingdom) if not kingdom.types or kingdom.types.length == 0
   typeMap = 
      '+2actions': 'isActionSupplier'
      'attack': 'isAttack'
      '+1buy': 'isBuySupplier'
      'duration': 'isDuration'
      'reaction': 'isReaction'
      'trashing': 'isTrashing'
      'victory': 'isVictory'
   costMap =
      'cost2': { 'cost.treasure': { $lte: 2 } }
      'cost3': { 'cost.treasure': 3 }
      'cost4': { 'cost.treasure': 4 }
      'cost5': { 'cost.treasure': 5 }
      'cost6': { 'cost.treasure': 6 }
      'cost7+': { 'cost.treasure': { $gte: 7 } }

   kingdom.filter.$or = [] unless kingdom.filter.$or
   for type in kingdom.types
      if typeMap[type]
         sub = {}
         sub[typeMap[type]] = true
         kingdom.filter.$or.push(sub)
      else if costMap
         kingdom.filter.$or.push(costMap[type])

   callback(null, kingdom)

fillKingdom = (kingdom, callback) ->
   cardsNeeded = 10 - (kingdom.cards?.length or 0)
   skipAlchemy = false

   if cardsNeeded < 10
      # Add cards that already are in the kingdom to the filter
      kingdom.filter._id = { $nin: [] } unless kingdom.filter._id
      kingdom.filter._id.$nin.push(c._id) for c in kingdom.cards

      if kingdom.replaceCards?.length > 0
         kingdom.filter._id.$nin.push(mongoose.Types.ObjectId(id)) for id in kingdom.replaceCards

      # Check if alchemy should be used
      alchemyCount = 0
      (alchemyCount++ if c.set.toString() == ALCHEMY_SET_ID) for c in kingdom.cards
      
      skipAlchemy = alchemyCount <= 0 or 3 - alchemyCount + kingdom.keepCards.length > 10
   else
      # Randomly decide if alchemy should be used
      skipAlchemy = kingdom.filter.set.$in.length > 2 and rand.getRandomInt(0, 3)

   # Update filter to exclude alchemy
   if skipAlchemy
      kingdom.skipAlchemy = true
      temp = (s for s in kingdom.filter.set.$in when s.toString() != ALCHEMY_SET_ID)
      kingdom.filter.set.$in = temp

   # Get the cards
   getCards cardsNeeded, kingdom.filter, (err, cards) ->
      return callback(err) if err
      kingdom.cards.push(card) for card in cards
      callback(null, kingdom)
      
alchemySetCorrection = (kingdom, callback) ->
   alchemyCards = (c for c in kingdom.cards when c.set.toString() == ALCHEMY_SET_ID)
   # Return if there are either more than 3 alchemy cards or none
   
   return callback(null, kingdom) if kingdom.skipAlchemy or not (0 < alchemyCards.length < 3)
   numNewCards = rand.getRandomInt(3, 6) - alchemyCards.length

   # Change numNewCards to be equal to the number
   if kingdom.keepCards?.length > 0
      # Check if the number of new cards needed is greater than the number of cards
      # that are being randomized
      numKeepCards = kingdom.keepCards.length
      numNewCards = 10 - numKeepCards if numKeepCards + numNewCards > 10

   # Return if the set is fine without new alchemy cards
   return callback(null, kingdom) if numNewCards == 0

   filter = 
      set: mongoose.Types.ObjectId(ALCHEMY_SET_ID)
      _id: { $nin: (c._id for c in alchemyCards) }
      
   filter.$or = kingdom.filter.$or if kingdom.filter.$or

   getCards numNewCards, filter, (err, newCards) ->
      replaceableCards = []
      nonReplaceableCards = []

      if kingdom.keepCards?.length > 0
         # Ensure that none of the keepCards are replaced with alchemy cards
         for card in kingdom.cards when card.set.toString() != ALCHEMY_SET_ID
            replaceable = true
            for keepCard in kingdom.keepCards
               if keepCard.toString() == card._id.toString()
                  nonReplaceableCards.push(card)
                  replaceable = false
                  break
            replaceableCards.push(card) if replaceable
      else
         replaceableCards.push(c) for c in kingdom.cards when c.set.toString() != ALCHEMY_SET_ID

      # Do replacements
      indexes = rand.getRandomInts(numNewCards, replaceableCards.length)
      replaceableCards[indexes[index]] = card for card, index in newCards

      # Smash the all cards back together and return
      alchemyCards.push(card) for card in replaceableCards
      alchemyCards.push(card) for card in nonReplaceableCards
      kingdom.cards = alchemyCards
      callback(null, kingdom)

actionSupplierCorrection = (kingdom, callback) ->

   for card in kingdom.cards
      if card.isActionSupplier
         return callback(null, kingdom)
         
   filter = 
      set: kingdom.filter.set
      _id: { $nin: (card._id for card in kingdom.cards) }
      isActionSupplier: true

   getCards 1, filter, (err, cards) ->
      return callback(err) if err
      evictIndex = rand.getRandomInt(0,10)
      kingdom.cards[evictIndex] = cards[0]
      callback(null, kingdom)

###
# Utilities
###
getCards = (count, filter, cb, secondTry) ->
   cards = []
   Cards.count(filter).exec (err, cardCount) ->
      return cb(err) if err

      # If there are no possible cards with this filter then remove the
      # types and try again
      if cardCount == 0
         return cb() if secondTry
         clonedFilter = {}
         (clonedFilter[k] = v unless k == '$or') for k, v of filter   
         return getCards count, clonedFilter, cb, true

      q = async.queue (index, callback) ->
         getCardFromIndex index, filter, (err, card) ->
            cards.push(card) if card
            callback(err)
      , 10
         
      indexes = rand.getRandomInts(count, cardCount)
      q.push(index) for index in indexes
      q.drain = (err) -> 
         return cb(err) if err
         # Check if need to restart without type filter
         if not secondTry and cards.length < count and filter.$or
            clonedFilter = {}
            (clonedFilter[k] = v unless k == '$or') for k, v of filter
            getCards (count - cards.length), clonedFilter, (err, moreCards) ->
               return cb(err) if err
               cards.push(c) for c in moreCards
               cb(null, cards)
            , true
         else
            cb(err, cards)


getCardFromIndex = (index, filter, cb) ->
   Cards.find(filter).lean().sort('_id').limit(1).skip(index).exec (err, cards) ->
      return cb(err) if err
      cb(null, cards[0])
