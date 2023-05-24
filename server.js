const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/mydb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Define a schema for license plate numbers
const plateSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  }
});

// Define a model for license plate numbers
const Plate = mongoose.model('Plate', plateSchema);

// Create an Express app
const app = express();

// Parse JSON request bodies
app.use(express.json());

// Define a POST route to receive license plate numbers
app.post('/plates', async (req, res) => {
  try {
    const plate = new Plate({
      number: req.body.license_plate_number
    });
    await plate.save();
    res.status(200).send('License plate number saved successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving license plate number.');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
