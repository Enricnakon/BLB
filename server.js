const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { CitizensModel, LandTitlesModel } = require('./models');
const app = express();

const port = process.env.PORT || 4000;

mongoose.connect('mongodb+srv://juma:juma@cluster0.tvrxlqa.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.static(path.join(__dirname, 'public')));

// Define a route for your HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Remove the duplicate route handler
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// Rest of your code...

app.post('/submitCitizen', (req, res) => {
  const newCitizen = new CitizensModel({
    name: req.body.name,
    dob: req.body.dob,
    father: req.body.father,
    mother: req.body.mother,
    gender: req.body.gender,
    blood_group: req.body.blood_group,
  });

  newCitizen.save()
    .then(() => {
      res.redirect('/viewCitizens');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving citizen data');
    });
});

app.post('/submitLandTitle', upload.single('satellitePhoto'), (req, res) => {
    const titleNumber = req.body.titleNumber;
    console.log('Received titleNumber:', titleNumber);
  
    // Create a new Land Title
    const newLandTitle = new LandTitlesModel({
      ownerName: req.body.ownerName,
      location: req.body.location,
      size: req.body.size,
      coordinates: req.body.coordinates,
      titleNumber: titleNumber,
      satellitePhoto: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });
  
    // Save the new Land Title
    newLandTitle.save()
      .then(() => {
        res.redirect('/viewLandTitles');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error saving land title data: ' + err.message);
      });
  });
  
  
// View citizen data
app.get('/viewCitizens', (req, res) => {
  CitizensModel.find({}).exec()
    .then((data) => {
      // Transform the data into the desired format
      const formattedData = data.map(entry => ({
        name: entry.name,
        dob: entry.dob,
        father: entry.father,
        mother: entry.mother,
        gender: entry.gender,
        blood_group: entry.blood_group,
      }));

      // Send the formatted data to the client
      res.json(formattedData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching citizen data');
    });
});

// View land title data
app.get('/viewLandTitles', (req, res) => {
  LandTitlesModel.find({}).exec()
    .then((data) => {
      // Transform the data into the desired format
      const formattedData = data.map(entry => ({
        ownerName: entry.ownerName,
        location: entry.location,
        size: entry.size,
        coordinates: entry.coordinates,
        titleNumber: entry.titleNumber,
        // Include only the name of the image file (excluding the path)
        imageName: `${entry.titleNumber}.jpg`, // Adjust the extension based on your setup
        // Include a link to the image based on the title number
        
      }));

      // Send the formatted data as a JSON object
      res.json(formattedData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching land title data');
    });

  });

// Rest of the code remains the same...

// Wrap the app.listen in a try-catch block
try {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
}



// Handle update Land Title form submission
// Handle Land Title Transfer form submission
app.post('/transferLandTitle', (req, res) => {
  const sourceTitleNumber = req.body.sourceTitleNumber;
  const destinationTitleNumber = req.body.destinationTitleNumber;

  console.log('Source Title Number:', sourceTitleNumber);

  LandTitlesModel.findOne({ titleNumber: sourceTitleNumber })
    .then((sourceLandTitle) => {
      console.log('Source Land Title:', sourceLandTitle);

      if (sourceLandTitle) {
        // Create a new Land Title for the destination owner with the same attributes
        const newLandTitle = new LandTitlesModel({
          ownerName: sourceLandTitle.ownerName,
          location: sourceLandTitle.location,
          size: sourceLandTitle.size,
          coordinates: sourceLandTitle.coordinates,
          titleNumber: destinationTitleNumber,
          satellitePhoto: {
            data: sourceLandTitle.satellitePhoto.data,
            contentType: sourceLandTitle.satellitePhoto.contentType,
          },
        });

        // Save the new Land Title for the destination owner
        return newLandTitle.save();
      } else {
        // Source Land Title not found
        res.status(404).send('Source Land Title not found');
      }
    })
    .then((updatedDestinationLandTitle) => {
      // Respond with the updated destination Land Title
      res.json(updatedDestinationLandTitle);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error transferring Land Title: ${err.message}`);
    });
});

  
  
// Server-side code
const fs = require('fs');

app.get('/searchLandTitle', (req, res) => {
  const titleNumber = req.query.titleNumber;

  LandTitlesModel.findOne({ titleNumber: titleNumber })
    .then((title) => {
      if (title) {
        res.json({
          ownerName: title.ownerName,
          location: title.location,
          size: title.size,
          coordinates: title.coordinates,
          titleNumber: title.titleNumber,
          imageName: `${title.titleNumber}.jpg`,
        });
      } else {
        res.status(404).send('Land Title not found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error searching for Land Title');
    });
});
