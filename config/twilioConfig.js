require("dotenv").config();
const accountSid = process.env.TWILIO_API_KEY_SID;
const authToken = process.env.TWILIO_API_KEY_SECRET;
const phone = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

const sendSMS = async (body) => {
  await client.messages
    .create({
      body: body.message,
      from: phone,
      to: body.phone,
    })
    .then((response) => console.log(response))
    .catch((err) => console.log(err));
};

module.exports = { sendSMS };
