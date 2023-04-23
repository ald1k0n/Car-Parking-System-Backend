const { Schema, model } = require("mongoose");

const adminSchema = new Schema({
  name: String,
  phone: String,
  password: String,
  role: {
    type: String,
    default: "admin",
  },
});

const Admin = model("Admin", adminSchema);

module.exports = Admin;
