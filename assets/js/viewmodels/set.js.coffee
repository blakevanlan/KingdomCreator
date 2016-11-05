#= require lib/all.js

do ->
   class SetViewModel
      constructor: (data) ->
         @id = data.id
         @name = data.name
         @active = ko.observable(if data.active? then data.active else true)
      
      toObject: () =>
         return {
            id: @id
            name: @name
            active: @active()
         }


   window.SetViewModel = SetViewModel
