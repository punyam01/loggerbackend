import mongoose from 'mongoose'

const scalpLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    itching: { type: Number, min: 0, max: 10 },
    flaking: { type: Number, min: 0, max: 10 },
    redness: { type: Number, min: 0, max: 10 },
    oiliness: { type: Number, min: 0, max: 10 },
    tightness: { type: Number, min: 0, max: 10 },
    tenderness: { type: Number, min: 0, max: 10 },
    hypopigmentation: { type: Number, min: 0, max: 10 },
    hairThinning: { type: Number, min: 0, max: 10 },
    dryness: { type: Number, min: 0, max: 10 }
  },
  symptomTiming: {
    startTime: { type: String }, // or Date if using full datetime
    endTime: { type: String }
  },
  scalpPhotos: [String], // array of URLs or file names
  productsUsed: {
    beaBayouProducts: [String], // List of selected checkboxes
    otherProducts: String
  },
  haircareRoutine: {
    hairstyle: String,
    wasWashDay: { type: Boolean, default: false }
  },
  stressLevel: { type: Number, min: 1, max: 10 },
  dietLifestyle: {
    meals: String,
    consumedAlcohol: { type: Boolean, default: false },
    highSugarIntake: { type: Boolean, default: false }
  },
  personalNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('ScalpLog', scalpLogSchema)
