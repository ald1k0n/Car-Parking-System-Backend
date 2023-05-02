const express = require("express");
const app = express();
const {
  addUserData,
  getAllUsers,
  getPositionById,
  getUserData,
  insertCarPlate,
  insertPosition,
  acceptAccount,
  checkCarPosition,
} = require("../controller/clientController");

app.get("/", getAllUsers);
app.get("/:id", getUserData);
app.post("/", addUserData);
app.put("/code", acceptAccount);

app.patch("/:id", insertCarPlate);
app.put("/position/:id", insertPosition);
app.get("/me/:id", getPositionById);

app.get("/car/:row/:column", checkCarPosition);

module.exports = app;
