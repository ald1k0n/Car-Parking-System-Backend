const { sendSMS } = require("../config/twilioConfig");

const testMessage = (req, res) => {
  sendSMS({
    message: "Привет мир!",
    phone: "+77058743672",
  });
  res.send("sent");
};

module.exports = {
  testMessage,
};
