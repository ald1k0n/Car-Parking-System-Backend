require("dotenv").config();
const accountSid = process.env.TWILIO_API_KEY_SID;
const authToken = process.env.TWILIO_API_KEY_SECRET;
const phone = process.env.TWILIO_NUMBER;
const messageSID = process.env.MESSAGE_SID;
const client = require("twilio")(accountSid, authToken);

const sendSMS = async (body) => {
  try {
    await client.messages
      .create({
        body: body.message,
        from: phone,
        to: body.phone,
      })
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  } catch (error) {
    console.error(error);
  }
};

const scheduleSMS = async (body) => {
  try {
    const currentDateWithMilliseconds = new Date();
    const futureDateWithMilliseconds = new Date(
      currentDateWithMilliseconds.getTime() + 900000
    );
    const isoValidFormat = futureDateWithMilliseconds.toISOString();
    await client.messages
      .create({
        messagingServiceSid: messageSID,
        body: "Time is up! Do you want to extend your parking time?",
        from: phone,
        to: body.phone,
        sendAt: body.time,
        scheduleType: "fixed",
      })
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  } catch (error) {
    console.error(error);
  }
};

module.exports = { sendSMS, scheduleSMS };
