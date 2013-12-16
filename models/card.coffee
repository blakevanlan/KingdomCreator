mongoose = require 'mongoose'
Schema = mongoose.Schema

cardSchema = new Schema(
   {
      name: { type: String, require: true },
      cost: { 
         treasure: { type: Number, require: true }
         potion: { type: Number, require: true }
      },
      set: { type: Schema.Types.ObjectId, ref: 'Set' }
      description: { type: String },
      isAttack: { type: Boolean, require: true },
      isAction: { type: Boolean, require: true },
      isTreasure: { type: Boolean, require: true },
      isVictory: { type: Boolean, require: true },
      isTrashing: { type: Boolean, require: true }
      isReaction: { type: Boolean, require: true }
   }
   , { collection: 'cards' })

module.exports = mongoose.model('Card', cardSchema)