Loader = require('./loader')

kingdoms = Loader.loadKingdoms()

names = {}

for setId, data of kingdoms
   for kingdom in data.kingdoms
      if names[kingdom.name]
         console.log("#{setId} - #{kingdom.name}")
      else 
         names[kingdom.name] = true