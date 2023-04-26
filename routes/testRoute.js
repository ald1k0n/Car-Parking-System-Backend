const { testMessage } = require("../controller/testController");
const express = require("express");
const app = express();

app.post("/test", testMessage);

module.exports = app;
