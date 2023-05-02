const { Schema, model } = require("mongoose");

const userCredentials = new Schema({
  name: String,
  phone: String,
  carPlate: String,
  idCardNumber: String,
  position: {
    type: Schema.Types.ObjectId,
    ref: "CarPlace",
  },
  password: String,
  acceptCode: String,
  isAccepted: {
    type: Boolean,
    default: false,
  },
  expirationTime: {
    type: Number,
    default: null,
  },
});

const Client = model("Client", userCredentials);

module.exports = Client;
