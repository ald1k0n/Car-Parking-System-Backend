require("dotenv").config();
const telesign = require("telesignsdk");

const cusmoterId = process.env.TELESIGN_CUSTOMER_ID;
const api = process.env.TELESIGN_API_KEY;

const rest_endpoint = "https://rest-api.telesign.com";
const timeout = 10 * 1000;

const client = new telesign(cusmoterId, api, rest_endpoint, timeout);

const phoneNumber = "77058743672";
const message = "TEST";
const messageType = "ARN";

const messageCallBack = (error, responseBody) => {
  if (error === null) {
    console.log(
      `Messaging response for messaging phone number: ${phoneNumber}` +
        ` => code: ${responseBody["status"]["code"]}` +
        `, description: ${responseBody["status"]["description"]}`
    );
  } else {
    console.error("Unable to send message. " + error);
  }
};

// client.sms.message(messageCallBack, phoneNumber, message, messageType);

const sendSMS = () => {
  client.sms.message(messageCallBack, phoneNumber, "Message for test", "ARN");
};

module.exports = { sendSMS };
