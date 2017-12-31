#= require lib/all.js
#= require lib/all.js
#= require settings/settings.js.coffee

do ->

   Settings = window.Settings

   loadSettings = ->
      options = $.cookie('options')
      options = if typeof options == 'string' then JSON.parse(options) else options
      return Settings.createFromObject(options)
   
   saveSettings = (settings) ->
      console.log("Saving settings", settings.toObject())
      $.cookie('options', settings.toObject(), {expires: 365})


   window.SettingsManager = {
      loadSettings: loadSettings
      saveSettings: saveSettings
   }