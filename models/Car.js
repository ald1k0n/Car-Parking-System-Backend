const { Schema, model } = require("mongoose");

const CarPlace = new Schema({
  row: Number,
  column: Number,
});

const Car = model("CarPlace", CarPlace);

module.exports = Car;
