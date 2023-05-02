const schedule = require("node-schedule");
const Client = require("../models/Client");
const { sendSMS } = require("./twilioConfig");

module.exports = async function () {
  try {
    const users = await Client.find({}).populate("position");
    users.forEach((time) => {
      if (time.expirationTime) {
        schedule.scheduleJob(time.expirationTime, async () => {
          await sendSMS({
            phone: time.phone,
            message: "Your time is coming up!",
          });
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};
