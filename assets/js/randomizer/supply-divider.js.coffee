#= require randomizer/supply-division.js.coffee
#= require utils/rand-util.js.coffee
#= require utils/segmented-range.js.coffee

do ->
   RandUtil = window.RandUtil
   SupplyDivision = window.SupplyDivision
   SegmentedRange = window.SegmentedRange

   class SupplyDivider
      constructor: (count) ->
         @count = count

      getCount: ->
         return @count

      subdivideDivisions: (divisions) ->
         newDivisions = []
         countsPerDivision = @getRandomizedCountsPerDivision(divisions)

         for division, index in divisions
            if countsPerDivision[index] > 0
               satisfyingCards = @getSatisfyingCards(division)
               satisfyingDivision =
                     new SupplyDivision(satisfyingCards, [], [], countsPerDivision[index])
               newDivisions.push(satisfyingDivision)

            if division.getTotalCount() - countsPerDivision[index] > 0
               remainingCards = @getRemainingCards(division)
               newCount = division.getTotalCount() - countsPerDivision[index]
               remainingDivision = new SupplyDivision(remainingCards, [], [], newCount)
               newDivisions.push(remainingDivision)

         return newDivisions

      getRandomizedCountsPerDivision: (divisions) ->
         segmentedRange = @createSegmentedRangeForSetId(divisions)
         randomIndices = 
               RandUtil.getRandomInts(@count, segmentedRange.getLength())
         
         countsPerDivision = []
         for division, index in divisions 
            countsPerDivision[index] = 0

         for index in randomIndices
            divisionIndex = segmentedRange.getSegmentForIndex(index)
            countsPerDivision[divisionIndex] += 1

         return countsPerDivision

      createSegmentedRangeForSetId: (divisions) ->
         satisfyingCardsPerDivision = @getSatisfyingCardsPerDivision(divisions)
         counts = []
         for cards in satisfyingCardsPerDivision
            counts.push(cards.length)
         return new SegmentedRange(0, counts)

      getSatisfyingCardsPerDivision: (divisions) ->
         satisfyingCardsPerDivision = []
         for division in divisions
            satisfyingCardsPerDivision.push(@getSatisfyingCards(division))
         return satisfyingCardsPerDivision

      getSatisfyingCards: (division) ->
         throw Error('Not implemented.')

      getRemainingCards: (division) ->
         throw Error('Not implemented.')


   window.SupplyDivider = SupplyDivider
