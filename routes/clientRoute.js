const express = require("express");
const app = express();
const {
  addUserData,
  getAllUsers,
  getPositionById,
  getUserData,
  insertCarPlate,
} = require("../controller/clientController");

app.get("/", getAllUsers);
app.get("/:id", getUserData);
app.post("/", addUserData);
app.patch("/:id", insertCarPlate);
app.get("/me/:id", getPositionById);

module.exports = app;
