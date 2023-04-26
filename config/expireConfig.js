const schedule = require("node-schedule");
const Client = require("../models/Client");
const { sendSMS } = require("./twilioConfig");

module.exports = async function () {
  try {
    const users = await Client.find({}).populate("position");
    users.forEach((time) => {
      schedule.scheduleJob(time.position.expirationTime, async () => {
        await sendSMS({
          phone: time.phone,
          message: "Your time is coming up in 5 minutes",
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
};
