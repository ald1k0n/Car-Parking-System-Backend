const { Schema, model } = require("mongoose");

const userCredentials = new Schema({
  name: String,
  phone: String,
  carPlate: String,
  idCardNumber: String,

  password: String,
  acceptCode: String,
  isAccepted: {
    type: Boolean,
    default: false,
  },
});

const Client = model("Client", userCredentials);

module.exports = Client;
