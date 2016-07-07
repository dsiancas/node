var mongoose = require('mongoose');

module.exports = mongoose.model('Permission', {
    permission_level: {
      admin: {type : String, default: 'admin'},
      view: {type : String, default: 'view'},
      editor: {type : String, default: 'editor'},
      fisher: {type : String, default: 'fisher'},
      plant: {type : String, default: 'plant'},
    }
});