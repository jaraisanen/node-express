const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  year: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4
  },
  date: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
})

// delete _id + _v from returned object
gameSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Game", gameSchema)
