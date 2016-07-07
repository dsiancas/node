var mongoose = require('mongoose');

module.exports = mongoose.model('Group', {
    name: {type : String, default: ''},
   	service: {type : String, default: ''},
   	boats: 
   		[{
   			mac_addr: {type : String, default: ''}
   		}]
   	
});