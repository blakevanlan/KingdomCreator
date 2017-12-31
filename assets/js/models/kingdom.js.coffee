do -> 
   class Kingdom
      constructor: (supply, events, landmarks, metadata) ->
         @supply = supply
         @events = events
         @landmarks = landmarks
         @metadata = metadata

      getSupply: ->
         return @supply

      getEvents: ->
         return @events

      getLandmarks: ->
         return @landmarks

      getMetadata: ->
         return @metadata


   class Metadata
      constructor: (useColonies, useShelters) ->
         @useColonies = useColonies
         @useShelters = useShelters

      getUseColonies: ->
         return @useColonies

      getUseShelters: ->
         return @useShelters


   window.Kingdom = Kingdom
   window.Kingdom.Metadata = Metadata
