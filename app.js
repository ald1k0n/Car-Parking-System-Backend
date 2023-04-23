require("dotenv").config();
const express = require("express");
const app = express();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const cors = require("cors");

const { connect } = require("mongoose");

connect("mongodb://localhost:27017/ocr")
  .then(() => console.log("It works baby!"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("tmp"));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use("/api/client", require("./routes/clientRoute"));
app.use("/api/admin", require("./routes/adminRoute"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./tmp");
  },
  filename: (req, file, cb) => {
    cb(null, "test.jpg");
  },
});

const upload = multer({ storage: storage });

app.use(express.static(__dirname + "uploads"));

app.post("/upload", upload.single("image"), (req, res) => {
  try {
    Tesseract.recognize(req.file.path, "eng", {
      logger: (m) => console.log(m),
    }).then((response) => {
      let newData = response.data.text.replace(/[^a-zA-Z0-9]+/g, "");
      newData = newData.substring(0, newData.length - 2);
      res.send(newData);
    });
  } catch (error) {
    res.status(500).send(req.file.path);
  }
});

app.post("/test", upload.array(), (req, res) => {
  const base64 = req.body.file.replace(/^data:image\/jpeg;base64,/, "");

  fs.writeFileSync(__dirname + "/tmp/test.jpeg", base64, "base64", (err) =>
    console.error(err)
  );

  try {
    Tesseract.recognize(__dirname + "/tmp/test.jpeg", "eng", {
      logger: (m) => console.log(m),
    }).then((response) => {
      let newData = response.data.text.replace(/[^a-zA-Z0-9]+/g, "");
      newData = newData.substring(0, newData.length - 2);
      console.log(newData);
      res.send(newData);
    });
  } catch (error) {
    res.status(500).send(req.file.path);
  }
});

app.listen(process.env.PORT | 4040, () => {
  console.log("Server is running on port 4040");
});
