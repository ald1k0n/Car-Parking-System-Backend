const { Schema, model } = require("mongoose");

const CarPlace = new Schema({
  row: Number,
  column: Number,
  expirationTime: {
    type: Number,
    default: null,
  },
});

const Car = model("CarPlace", CarPlace);

module.exports = Car;
