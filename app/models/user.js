var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
   	email: {type : String, default: ''},
   	first_name: {type : String, default: ''},
   	last_name: {type : String, default: ''},
   	date_joined: {type : String, default: ''},
   	invited_by: {type : String, default: ''},
   	is_staff: {type : String, default: ''},
   	is_active: {type : String, default: ''},
   	permission_level: {type : String, default: ''},
});