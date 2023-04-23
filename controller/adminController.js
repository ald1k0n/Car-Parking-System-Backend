require("dotenv").config();
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_TOKEN;

const createAdmin = (req, res) => {
  const { name, password, phone } = req.body;

  if (!name || !password || !phone) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  Admin.create({
    name,
    password: bcrypt.hashSync(password, 7),
    phone,
  })
    .then((user) => {
      const token = jwt.sign(
        { id: user._id, name: user.name, phone: user.phone },
        secret,
        { expiresIn: 3600 }
      );
      res.status(200).json({
        token,
      });
    })
    .catch(() => res.sendStatus(500));
};

const loginAdmin = (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  Admin.findOne({ phone }).then((user) => {
    if (!user) return res.status(400).json({ msg: "User does not exist" });
    else {
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ msg: "Invalid credentials" });
      } else {
        if (user.role !== "admin")
          return res.status(400).json({ msg: "Invalid credentials" });
        else {
          const token = jwt.sign(
            { id: user._id, name: user.name, phone: user.phone },
            secret,
            { expiresIn: 3600 }
          );
          res.status(200).json({
            token,
          });
        }
      }
    }
  });
};

const getAdmin = (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    Admin.findOne({ _id: decoded.id })
      .select("-password")
      .then((user) => res.json(user));
  } else {
    res.sendStatus(401);
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  getAdmin,
};
