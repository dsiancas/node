var mongoose = require('mongoose');

module.exports = mongoose.model('Service', {
    service: {
      eye: {type : String, default: 'eye'},
      coast: {type : String, default: 'coast'},
      origin: {type : String, default: 'origin'},
      consumer: {type : String, default: 'consumer'},
      all: {type : String, default: 'all'},
      eye_analytics: {type : String, default: 'eye_analytics'},
      coast_analytics: {type : String, default: 'coast_analytics'},
    }
});