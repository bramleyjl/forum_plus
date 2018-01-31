'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );
let humanTime = require( 'human-time' );
let moment = require('moment');
let markdown = require( 'markdown' ).markdown;

module.exports = function ( db ) {

    var router = express.Router();

    router.get( '/', function ( req, res ) {
      if ( req.user ) {
        db.getRecentThreads( 30 ).then( ( threads ) => {
          for (var i in threads) {
          threads[i]['humanTime'] = moment(threads[i]['created']).fromNow();
          }
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
        db.getUser( req.body.username )
          .then( (user) => {
            if (user.length !== 0) {
              return user;
            } else {
              return db.createUser( req.body.username ).then( () => {
                return db.getUser( req.body.username );
              } );
            }
          })
          .then( (user) => {
            return db.createSession(user.pop().id); 
          })
          .then ( (token) => {
            res.cookie('login_token', token);
            res.redirect('/');
          })
          .catch( (err) => {
            console.log("Error: " + err);
        })
      }
      checkName(req.body.username);
    });

    router.get( '/logout', function ( req, res ) {
      db.authenticateToken( req.cookies.login_token )
        .then( (userId) => {
          console.log(userId[0].id)
          db.deleteSessions(userId[0].id)
          res.clearCookie('login_token');
          res.redirect( '/' );
        })
    });

    return router;

};
