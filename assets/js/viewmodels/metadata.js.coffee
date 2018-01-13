#= require lib/all.js

do ->
   class MetadataViewModel
      constructor: () ->
         @useColonies = ko.observable(false)
         @useShelters = ko.observable(false)
         @show = ko.computed () => return @useColonies() or @useShelters()

      update: (metadata) ->
         @useColonies(metadata.getUseColonies())
         @useShelters(metadata.getUseShelters())


   window.MetadataViewModel = MetadataViewModel
