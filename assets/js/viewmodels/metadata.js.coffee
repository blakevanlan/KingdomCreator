#= require lib/all.js

do ->
   class MetadataViewModel
      constructor: () ->
         @useColonies = ko.observable(false)
         @useShelters = ko.observable(false)
         @show = ko.computed () => return @useColonies or @useShelters()

      update: (data) ->
         @useColonies(data.useColonies or false)
         @useShelters(data.useShelters or false)


   window.MetadataViewModel = MetadataViewModel
