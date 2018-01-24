'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );
let humanTime = require( 'human-time' );
let markdown = require( 'markdown' ).markdown;

module.exports = function ( db ) {

    var router = express.Router();

    router.get( '/', function ( req, res ) {
      if ( req.user ) {
        db.getRecentThreads( 10 ).then( ( threads ) => {
          res.send( views.index( req.user, threads ) );
        } ).catch( ( err ) => {
          res.send( views.error( err ) );
        } )
      } else {
        res.send( views.login() );
      }
    } );

    router.get( '/login', function ( req, res) {
      res.redirect('/')
    })

    router.post( '/login', function ( req, res ) {
      function checkName(username) { 
        db.query("SELECT * FROM `users` WHERE `name` = ?", [username])
          .then( (user) => {
            if (user.length !== 0) {
              return user;
            } else {
              return db.createUser( req.body.username ).then( () => {
                return db.findUser( req.body.username );
              } );
            }
          })
          .then( (user) => {
            return db.createSession(user.pop().id); 
          })
          .then ( (token) => {
            res.cookie('login_token', token);
            return db.getRecentThreads( 10 )
          }).then( ( threads ) => {
            res.redirect('/');
          })
          .catch( (err) => {
            console.log("Error: " + err);
        })
      }
      checkName(req.body.username);
    });

    router.get( '/logout', function ( req, res ) {
      db.query("SELECT `user` FROM `sessions` WHERE `token` = ?", [req.cookies.login_token])
        .then( (userId) => {
          db.query("DELETE FROM `sessions` WHERE `user` = ?", [userId[0].user])
          res.clearCookie('login_token');
          res.send( views.login() );
        })
    });

    return router;

};
