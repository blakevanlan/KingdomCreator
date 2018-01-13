do ->
   class Range 
      constructor: (start, length) ->
         @start = start 
         @length = length

      getStart: ->
         return @start 

      getLength: ->
         return @length

      getEnd: ->
         return @start + @length

      isInRange: (index) ->
         return @start <= index < @getEnd()

      @createFromIndices: (start, end) ->
         return new Range(start, end - start)


   window.Range = Range
