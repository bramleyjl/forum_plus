"use strict";
var express = require( 'express' );
let views = require( '../helpers/views.js' );

module.exports = function ( db ) {

    var router = express.Router();

    router.get( '/:name', function ( req, res ) {
      if ( req.user ) {
        var userData = [];
        db.getUser( req.params.name )
        .then( (user) => {
          if (user.length !== 0) {
            userData.push(user[0])
            return db.getUserMessages(user[0].id)
          } else {
            res.send( views.error("This user doesn't appear to exist.") );
          } 
        })
        .then( (messages) => {
          res.send( views.viewUser(req.user, userData.pop(), messages) );
        })
      } else {
        res.redirect( '/' );
      }      
    } );

    return router;

};
