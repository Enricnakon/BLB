const mongoose = require('mongoose');
 

const citizensSchema = new mongoose.Schema({
  name: String,
  dob: Date,
  father: String,
  mother: String,
  gender: String,
  blood_group: String,
});

const CitizensModel = mongoose.model('Citizens', citizensSchema);

const landTitlesSchema = new mongoose.Schema({
    ownerName: String,
    location: String,
    size: String,
    coordinates: String,
    titleNumber: {
      type: String,
      unique: false, // Set to false to remove uniqueness constraint
    },
    satellitePhoto: {
      data: Buffer,
      contentType: String,
    },
  });
  
  const LandTitlesModel = mongoose.model('LandTitles', landTitlesSchema);
  
  module.exports = { CitizensModel, LandTitlesModel };
  