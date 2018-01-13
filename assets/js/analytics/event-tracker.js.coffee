do ->
   Event = {
      LOAD_FULL_KINGDOM_FROM_URL: 'LOAD_FULL_KINGDOM_FROM_URL'
      LOAD_PARTIAL_KINGDOM_FROM_URL: 'LOAD_PARTIAL_KINGDOM_FROM_URL'
      RANDOMIZE_EVENTS_AND_LANDMARKS: 'RANDOMIZE_EVENTS_AND_LANDMARKS'
      RANDOMIZE_KINGDOM: 'RANDOMIZE_KINGDOM'
      RANDOMIZE_MULTIPLE: 'RANDOMIZE_MULTIPLE'
      RANDOMIZE_SINGLE: 'RANDOMIZE_SINGLE'
   }

   Category = {
      ERROR: 'error'
      EVENT: 'event'
   }

   class EventTracker

      @trackEvent: (eventType) ->
         EventTracker.attemptToSend(Category.EVENT, eventType)

      @trackError: (eventType) ->
         EventTracker.attemptToSend(Category.ERROR, errorType)

      ### Private methods ###

      @attemptToSend: (category, type) ->
         if window.ga
            ga('send', 'event', category, type)


   window.EventTracker = EventTracker
   window.EventTracker.Event = Event
   window.EventTracker.Error = Error
