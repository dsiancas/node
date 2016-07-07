 // app/routes.js

// grab the nerd model we just created
var Boat = require('./models/boat');
var Group = require('./models/group');
var Permission = require('./models/permission');
var Service = require('./models/service');
var User = require('./models/user');

    module.exports = function(app) {

        // server routes ===========================================================
        // handle things like api calls
        // authentication routes

        // sample api route
        app.get('/api/boats', function(req, res) {
            // use mongoose to get all nerds in the database
            Boat.find(function(err, boats) {

                // if there is an error retrieving, send the error. 
                                // nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.json(boats); // return all nerds in JSON format
            });
        });

        // route to handle creating goes here (app.post)
        // route to handle delete goes here (app.delete)

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('*', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

    };
