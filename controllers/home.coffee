express = require('express')
path = require('path')
fs = require('fs')
yaml = require('js-yaml')

module.exports = app = express()

tokenize = (str) -> str.replace(/[\s'-]/g, '').toLowerCase()

# Read the sets.
console.log("Loading sets...")

sets = {}
setDirectory = path.join(__dirname, '../sets')
setFiles = fs.readdirSync(setDirectory)
for setFile in setFiles
   filename = path.join(setDirectory, setFile) 
   id = tokenize(path.basename(setFile, '.yaml'))
   sets[id] = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
   sets[id].id = id

# Create an id for each card.
for setId, set of sets
   for card in set.cards
      card.id = "#{setId}_#{tokenize(card.name)}"
      card.setId = setId

console.log("Finished loading sets.")


app.get '/', (req, res, next) ->   
   res.render('home', {sets: sets})
