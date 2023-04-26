const Client = require("../models/Client");
const Car = require("../models/Car");

const { sendSMS } = require("../config/twilioConfig");

const getUserData = async (req, res) => {
  try {
    const user = await Client.findOne({ _id: req.params.id }).populate(
      "position"
    );
    if (user) {
      res.status(200).json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.sendStatus(500);
  }
};

const addUserData = (req, res) => {
  const { name, phone, idCardNumber } = req.body;
  const randomCode = Math.floor(Math.random() * 99999);
  try {
    new Client({
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
  ).then(() =>
    res
      .status(200)
      .json({
        message: "Account has been accepted",
      })
      .catch(() => res.sendStatus(500))
  );
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
      });
    } catch (error) {
      res.sendStatus(500);
    }
  }
};

const insertPosition = async (req, res) => {
  try {
    const slots = await Car.find({});
    const candidate = await Client.findById(req.body.id);
    if (slots.length < 18) {
      const newPlace = slots.length + 1;
      const row = Math.ceil(newPlace / 6);
      const column = newPlace % 6 === 0 ? 6 : newPlace % 6;

      await Car.create({ row, column })
        .then((response) => response._id)
        .then(async (id) => {
          try {
            await Client.findByIdAndUpdate(req.body.id, {
              $set: {
                position: id,
                expirationTime: Date.now() + 10000,
              },
            });

            Client.findOne({ _id: req.body.id })
              .populate("position")
              .then(async (response) => {
                await sendSMS({
                  phone: response.phone,
                  message: `\nYour car plate is ${response.carPlate}\n Position: row: ${response.position.row} \n column ${response.position.column}`,
                });
              })
              .then(() =>
                res.status(201).json({ message: "Car plate added into user" })
              );
          } catch (error) {
            res.sendStatus(400);
          }
        });
    } else {
      await sendSMS({
        phone: candidate.phone,
        message: `Sorry, parking lot is full`,
      });
      res.status(200).json({
        message: "Parking lot is full",
      });
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

// const insertCarPlate = async (req, res) => {
//   const { carPlate } = req.body;
//   if (carPlate.length === 0) {
//     res.status(400).json({ message: "Car plate is empty, try again" });
//   } else {
//     const candidate = await Client.findOne({ _id: req.params.id }).populate(
//       "position"
//     );
//     if (candidate.carPlate) {
//       await sendSMS({
//         phone: candidate.phone,
//         message: `You already have a car plate: ${candidate.carPlate} and a car place`,
//       });
//       res.status(200).json({
//         message: "User already has a car plate",
//       });
//     } else {
//       try {
//         const slots = await Car.find({});
//         if (slots.length < 18) {
//           const newPlace = slots.length + 1;
//           const row = Math.ceil(newPlace / 6);
//           const column = newPlace % 6 === 0 ? 6 : newPlace % 6;
//           await new Car({
//             row,
//             column,
//           })
//             .save()
//             .then((response) => response._id)
//             .then(async (id) => {
//               try {
//                 await Client.updateOne(
//                   { _id: req.params.id },
//                   {
//                     $set: { carPlate: carPlate, position: id },
//                   }
//                 );
//                 Client.findOne({ _id: req.params.id })
//                   .populate("position")
//                   .then(async (response) => {
//                     await sendSMS({
//                       phone: response.phone,
//                       message: `\nYour car plate is ${response.carPlate}\n Position: row: ${response.position.row} \n column ${response.position.column}`,
//                     });
//                   });
//               } catch (error) {
//                 console.log(error);
//                 res.sendStats(500);
//               }
//               res.status(201).json({ message: "Car plate added into user" });
//             })
//             .catch(() => res.sendStatus(500));
//         } else {
//           await sendSMS({
//             phone: candidate.phone,
//             message: `Sorry, parking lot is full`,
//           });

//           res.status(200).json({
//             message: "Parking lot is full",
//           });
//         }
//       } catch (err) {
//         console.log(err);

//         res.sendStatus(500);
//       }
//     }
//   }
// };

const getAllUsers = (req, res) => {
  Client.find({})
    .populate("position")
    .then((response) => res.status(200).json(response))
    .catch(() => res.sendStatus(500));
};

const getPositionById = (req, res) => {
  Client.findOne({ _id: req.params.id })
    .populate("position")
    .then((response) =>
      res.status(200).json({
        position: response.position,
        carPlate: response.carPlate,
      })
    )
    .catch(() => res.sendStatus(500));
};

module.exports = {
  getUserData,
  addUserData,
  insertCarPlate,
  getAllUsers,
  getPositionById,
  insertPosition,
  acceptAccount,
};
