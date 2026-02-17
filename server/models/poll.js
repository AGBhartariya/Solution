const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },

    options: {
      type: [optionSchema],
      validate: [
        arr => arr.length >= 2,
        "At least two options are required"
      ]
    },

    // Track voters (IP / client id)
    voters: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Poll ||
  mongoose.model("Poll", pollSchema);
