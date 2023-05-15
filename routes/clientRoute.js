const express = require("express");
const app = express();
const {
  addUserData,
  getPositionById,
  getUserData,
  insertCarPlate,
  insertPosition,
  acceptAccount,
  checkCarPosition,
  loginUser,
  makePayment,
  getAllEmptyPositions,
  deletePayment,
  changePassword,
  rentCarPosition,
} = require("../controller/clientController");

app.post("/", addUserData);
app.get("/position", getAllEmptyPositions);

app.get("/:id", getUserData);
app.patch("/:id", deletePayment);
app.patch("/:id/password", changePassword);
app.put("/code", acceptAccount);
app.post("/login", loginUser);

app.put("/position/:row/:column", rentCarPosition);

app.put("/payment/:id", makePayment);

app.patch("/:id", insertCarPlate);
app.put("/position/:id", insertPosition);
app.get("/me/:id", getPositionById);

app.get("/car/:row/:column", checkCarPosition);

module.exports = app;
