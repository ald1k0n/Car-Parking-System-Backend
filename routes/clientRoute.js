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
  loginUser,
  makePayment,
} = require("../controller/clientController");

const verifyToken = require("../middleware/authMiddleware");

app.get("/", getAllUsers);
app.post("/", addUserData);

app.get("/:id", getUserData);
app.put("/code", acceptAccount);

app.put("/payment/:id", makePayment);

app.patch("/:id", insertCarPlate);
app.put("/position/:id", insertPosition);
app.get("/me/:id", getPositionById);
app.post("/login", loginUser);

app.get("/car/:row/:column", checkCarPosition);

module.exports = app;
