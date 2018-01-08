#= require randomizer/supply-division.js.coffee
#= require utils/rand-util.js.coffee
#= require utils/range.js.coffee
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
            remainingDivisionTotalCount = division.getTotalCount() - countsPerDivision[index]

            if remainingDivisionTotalCount > 0
               remainingCards = @getRemainingCards(division)
               remainingDivision =
                     new SupplyDivision(remainingCards, [], [], remainingDivisionTotalCount)
               newDivisions.push(remainingDivision)

            if countsPerDivision[index] > 0
               satisfyingCards = @getSatisfyingCards(division)
               satisfyingDivision =
                     new SupplyDivision(satisfyingCards, [], [], countsPerDivision[index])
               newDivisions.push(satisfyingDivision)

         count = 0 
         for division in newDivisions
            count += division.getTotalCount()

         if count > 10
            debugger


         return newDivisions

      getRandomizedCountsPerDivision: (divisions) ->
         ranges = @createRangesForDivisions(divisions)
         sumOfMins = 0

         countsPerDivision = []
         for range in ranges
            minCount = range.getStart()
            countsPerDivision.push(minCount)
            sumOfMins += minCount

         if sumOfMins > @count
            throw Error('Unable to divide division. Too few remaining cards.')

         numberToRandomize = @count - sumOfMins
         if numberToRandomize == 0
            return countsPerDivision

         segmentedRange = @createSegmentedRangeFromRanges(ranges)
         if segmentedRange.getLength() < numberToRandomize
            throw Error('Unable to divide division. Too few satisfying cards.')
         
         # Allocate the remaining card counts to random divisions. Divisions with more matching
         # cards are more likely to receive the additional cards.
         randomIndices = RandUtil.getRandomInts(numberToRandomize, segmentedRange.getLength())
         for index in randomIndices
            divisionIndex = segmentedRange.getSegmentForIndex(index)
            countsPerDivision[divisionIndex] += 1

         return countsPerDivision

      createSegmentedRangeFromRanges: (ranges) ->
         lengths = []
         for range in ranges
            lengths.push(range.getLength())
         return new SegmentedRange(0, lengths)

      createRangesForDivisions: (divisions) ->
         satisfyingCardsPerDivision = @getSatisfyingCardsPerDivision(divisions)
         ranges = []
         for cards, index in satisfyingCardsPerDivision
            unfilledCount = divisions[index].getUnfilledCount()
            remainingCount = divisions[index].getAvailableCards().length - cards.length
            min = Math.max(unfilledCount - remainingCount, 0)
            max = Math.min(unfilledCount, cards.length)
            ranges.push(new Range(min, max - min))
         return ranges

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
