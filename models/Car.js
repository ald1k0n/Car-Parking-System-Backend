const { Schema, model } = require("mongoose");

const CarPlace = new Schema({
  row: Number,
  column: Number,
  clientId: {
    type: Schema.Types.ObjectId,
    ref: "Client",
    default: null,
  },
  isPayed: {
    type: Boolean,
    default: false,
  },
});

const Car = model("CarPlace", CarPlace);

module.exports = Car;
