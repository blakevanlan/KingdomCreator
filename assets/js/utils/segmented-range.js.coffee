#= require utils/rand-util.js.coffee
#= require utils/range.js.coffee

do ->
   RandUtil = window.RandUtil
   Range = window.Range

   class SegmentedRange extends Range
      constructor: (start, segmentLengths) ->
         fullLength = 0
         fullLength += length for length in segmentLengths
         
         super(start, fullLength)
         @segmentLengths = segmentLengths

      getSegmentForIndex: (index) ->
         segmentEnd = 0
         for segmentLength, i in @segmentLengths
            segmentEnd += segmentLength
            if (index < segmentEnd)
               return i
         return -1

      getRandomSegmentIndex: () ->
         rangeIndex = RandUtil.getRandomInt(0, @getLength())
         return @getSegmentForIndex(rangeIndex)

      isInRange: (index) ->
         return @start <= index < @getEnd()


   window.SegmentedRange = SegmentedRange
