require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"].includes("Bearer");

  if (!token) {
    return res.status(403).json({
      msg: "No token provided",
    });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN);
      req.user = decoded;
    } catch (error) {
      return res.status(401).send("Invalid Token");
    }
  }
  return next();
};

module.exports = verifyToken;
