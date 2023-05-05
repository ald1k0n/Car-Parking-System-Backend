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
} = require("../controller/clientController");

const verifyToken = require("../middleware/authMiddleware");

app.get("/", getAllUsers);
app.post("/", addUserData);

app.get("/:id", getUserData);
app.put("/code", acceptAccount);

app.patch("/:id", verifyToken, insertCarPlate);
app.put("/position/:id", verifyToken, insertPosition);
app.get("/me/:id", getPositionById);
app.post("/login", loginUser);

app.get("/car/:row/:column", verifyToken, checkCarPosition);

module.exports = app;
