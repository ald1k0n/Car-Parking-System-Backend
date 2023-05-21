require("dotenv").config();
const Client = require("../models/Client");
const Car = require("../models/Car");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { sendSMS, scheduleSMS } = require("../config/twilioConfig");

const getUserData = async (req, res) => {
  try {
    const user = await Client.findOne({ _id: req.params.id });
    const position = await Car.findOne({ clientId: req.params.id });

    const value = {
      user,
      position,
    };

    if (user) {
      res.status(200).json(value);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.sendStatus(500);
  }
};

const addUserData = (req, res) => {
  const { name, phone, idCardNumber, password } = req.body;
  const randomCode = Math.floor(Math.random() * 99999);
  try {
    new Client({
      password: bcrypt.hashSync(password, 10),
      name,
      phone,
      idCardNumber,
      acceptCode: randomCode,
    })
      .save()
      .then((response) => res.status(201).json(response))
      .then(async () => {
        await sendSMS({
          phone,
          message: `Code for activate ur account: ${randomCode}`,
        });
      })
      .catch(() => res.sendStatus(500));
  } catch (error) {
    res.sendStatus(500);
  }
};

const acceptAccount = (req, res) => {
  const { code } = req.body;

  Client.findOneAndUpdate(
    {
      acceptCode: code,
    },
    {
      $set: {
        isAccepted: true,
      },
    }
  )
    .then(() =>
      res.status(200).json({
        message: "Account has been accepted",
      })
    )
    .catch(() => res.sendStatus(500));
};

const insertCarPlate = async (req, res) => {
  const { carPlate } = req.body;

  if (carPlate.length === 0) {
    res.status(400).json({ message: "Car plate is empty, try again" });
  } else {
    try {
      await Client.findByIdAndUpdate(req.params.id, {
        $set: {
          carPlate,
        },
      }).then((response) => res.status(200).json(response));
    } catch (error) {
      res.sendStatus(500);
    }
  }
};

// const insertPosition = async (req, res) => {
//   try {
//     const slots = await Car.find({});
//     const candidate = await Client.findById(req.params.id).populate("position");
//     if (slots.length < 18) {
//       const newPlace = slots.length + 1;
//       const row = Math.ceil(newPlace / 6);
//       const column = newPlace % 6 === 0 ? 6 : newPlace % 6;

//       await Car.create({ row, column })
//         .then((response) => response._id)
//         .then(async (id) => {
//           try {
//             await Client.findByIdAndUpdate(req.params.id, {
//               $set: {
//                 position: id,
//               },
//             });

//             await Client.findOne({ _id: req.params.id })
//               .populate("position")
//               .then((response) => {
//                 console.log(response);

//                 sendSMS({
//                   phone: response.phone,
//                   message: `\nYour car plate is ${response.carPlate}\n Position: row: ${response.position.row} \n column ${response.position.column}`,
//                 });

//                 scheduleSMS({
//                   phone: response.phone,
//                 });
//               })
//               .then(() =>
//                 res.status(201).json({ message: "Car plate added into user" })
//               );
//           } catch (error) {
//             res.sendStatus(400);
//           }
//         });
//     } else {
//       await sendSMS({
//         phone: candidate.phone,
//         message: `Sorry, parking lot is full`,
//       });
//       res.status(200).json({
//         message: "Parking lot is full",
//       });
//     }
//   } catch (error) {
//     res.sendStatus(500);
//   }
// };

const insertPosition = async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Car.find({
      clientId: null,
    });
    console.log(candidate, "candidate");
    if (candidate.length > 0) {
      const placeId = candidate[0]._id;
      console.log(placeId, "place id");
      try {
        await Car.updateOne(
          { _id: placeId },
          {
            $set: {
              clientId: id,
            },
          }
        ).then(() => {
          Car.findOne({ clientId: id })
            .populate("clientId")
            .then(async (response) => {
              await sendSMS({
                phone: response.clientId.phone,
                message: `\nYour car plate is ${response.clientId.carPlate}\n Position: row: ${response.row} \n column ${response.column}.\n Don't forget to pay for the parking period`,
              });
              res.status(201).json({
                message: `\nYour car plate is ${response.clientId.carPlate}\n Position: row: ${response.row} \n column ${response.column}.\n Don't forget to pay for the parking period`,
              });
            });
        });
      } catch (error) {
        res.status(400).json(error);
      }
    } else {
      res.status(404).send("No available car places.");
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const getAllEmptyPositions = (req, res) => {
  Car.find({})
    .populate("clientId")
    .then((response) => {
      console.log(response);
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(400).json(err);
      console.log(err);
    });
};

const makePayment = async (req, res) => {
  const { isPayment, period } = req.body;
  const { id } = req.params;

  const periods = {
    0: new Date(new Date().getTime() + 900000).toISOString(),
    1: new Date(new Date().getTime() + 3_600_000).toISOString(),
    2: new Date(new Date().getTime() + 10_800_000).toISOString(),
  };

  if (!isPayment) {
    Car.updateOne(
      { clientId: id },
      {
        $set: {
          clientId: null,
        },
      }
    );
  } else {
    try {
      await Car.updateOne(
        { clientId: id },
        {
          $set: {
            isPayed: true,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }

    Client.findById(id)
      .then(async (response) => {
        Car.updateOne({ clientId: id }, { $set: { isPayed: true } })
          .then(() => {
            console.log("Done");
          })
          .catch((err) => {
            console.error(err);
            return;
          });
        const time = periods[period];
        await sendSMS({
          message: `Your time period is ${time}`,
          phone: response.phone,
        });
        await scheduleSMS({
          phone: response.phone,
          time,
        });
        res.status(200).json({
          time,
        });
      })
      .catch((err) => res.status(400).json(err));
  }
};

const getPositionById = (req, res) => {
  Car.findOne({ clientId: req.params.id })
    .populate("clientId")
    .then((response) => res.status(200).json(response))
    .catch((err) => res.sendStatus(500));
};

const checkCarPosition = async (req, res) => {
  const { row, column } = req.params;

  try {
    Car.findOne({ row, column }).then((response) => {
      if (response) {
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: "Car not found" });
      }
    });
  } catch (error) {
    res.sendStatus(500);
  }
};

const deletePayment = async (req, res) => {
  const { id } = req.params;

  Car.findOneAndUpdate(
    { clientId: id },
    {
      $set: {
        clientId: null,
      },
    }
  )
    .then(() =>
      res.status(200).json({
        message: "You didn't pay for a rent, your place is going to be empty",
      })
    )
    .catch((err) => res.status(400).json(err));
};

const loginUser = (req, res) => {
  const { phone, password } = req.body;

  Client.findOne({ phone }).then((user) => {
    if (!user) return res.status(400).json({ message: "User not found" });
    else {
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: "Password is incorrect" });
      } else {
        const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, {
          expiresIn: 86400,
        });
        const values = {
          token,
          name: user.name,
          phone: user.phone,
          idCardNumber: user.idCardNumber,
          isAccepted: user.isAccepted,
          id: user._id,
        };
        return res.status(200).json(values);
      }
    }
  });
};

const changePassword = async (req, res) => {
  try {
    const candidate = await Client.findOne({ _id: req.params.id });
    if (!candidate)
      res.status(404).json({
        message: "User not found",
      });
    else {
      if (!bcrypt.compareSync(req.body.password, candidate.password)) {
        return res.status(404).json({ message: "Password didn't match" });
      } else {
        try {
          await Client.updateOne(
            {
              _id: req.params.id,
            },
            {
              $set: {
                password: bcrypt.hashSync(req.body.newPassword, 10),
              },
            }
          );
          res.status(201).json({
            message:
              "Password has been changed, in the next authentication you shall enter with your new password",
          });
        } catch (error) {
          res.sendStatus(500);
        }
      }
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const rentCarPosition = async (req, res) => {
  const { row, column } = req.params;
  const { clientId } = req.query;
  try {
    const position = await Car.findOne({ row, column });
    if (position.clientId) {
      res.status(400).json({
        message: "That place already rented",
      });
    } else {
      await Car.updateOne(
        {
          row,
          column,
        },
        {
          $set: {
            clientId,
          },
        }
      );

      Car.findOne({ clientId })
        .populate("clientId")
        .then(async (response) => {
          await sendSMS({
            phone: response.clientId.phone,
            message: `\nYour car plate is ${response.clientId.carPlate}\n Position: row: ${response.row} \n column ${response.column}.\n Don't forget to pay for the parking period`,
          });
        })
        .catch((err) => console.error(err));

      res.status(201).json({
        message: `Your position in row:${row}, column:${column}`,
      });
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const checkAccess = async (req, res) => {
  const { clientId } = req.body;
  try {
    const pos = await Car.findOne({ clientId });
    if (!pos) {
      res.status(404).json({
        message:
          "You don't have an access for a parking. Would you make a rent?",
      });
    } else {
      if (parseInt(pos.expireTime) <= Date.now()) {
        Car.updateOne(
          {
            clientId,
          },
          {
            $set: {
              clientId: null,
              isPayed: false,
              expireTime: null,
            },
          }
        )
          .then(() => {
            res.status(200).json({
              message: "Your expire time has been up",
            });
          })
          .catch((err) => res.status(500).json(err));
      } else {
        res.status(200).json({
          message: "Access granted",
        });
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getUserData,
  addUserData,
  insertCarPlate,
  getPositionById,
  insertPosition,
  acceptAccount,
  loginUser,
  checkCarPosition,
  makePayment,
  getAllEmptyPositions,
  deletePayment,
  changePassword,
  rentCarPosition,
  checkAccess,
};
