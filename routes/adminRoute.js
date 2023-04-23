const express = require("express");
const app = express();

const {
  createAdmin,
  loginAdmin,
  getAdmin,
} = require("../controller/adminController");

app.post("/create", createAdmin);
app.post("/login", loginAdmin);
app.get("/getAdmin", getAdmin);

module.exports = app;
