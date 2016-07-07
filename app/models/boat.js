// var restful = require('node-restful');
var mongoose = require('mongoose');

module.exports = mongoose.model('Boat', {
    // name : {type : String, default: ''}
   	mac_address: {type : String, default: ''},
  	// port: {name: String, description: String},
  	// country: {zone: String, name: String, code: String},
  	// company: {name: String, logo: String, address: String, phone: [{ location:String, code: Number, number: Number }]}
});

// var BoatSchema = new mongoose.Schema({
  // mac_address: String,
  // port: {name: String, description: String},
  // country: {zone: String, name: String, code: String},
  // company: {name: String, logo: String, address: String, phone: [{ location:String, code: Number, number: Number }]}
// });

// module.exports = restful.model('Boat', BoatSchema);
