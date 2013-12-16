mongoose = require 'mongoose'
Schema = mongoose.Schema

setSchema = new Schema(
   {
      name: { type: String, require: true },
   }
   , { collection: 'sets' })

module.exports = mongoose.model('Set', setSchema)