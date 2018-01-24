'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );
let humanTime = require( 'human-time' );
let markdown = require( 'markdown' ).markdown;

module.exports = function ( db ) {

    var router = express.Router();

    router.get('/', function ( req, res ) {
      res.redirect( '/' );
    })

    router.get( '/create-thread', function ( req, res ) {
      if ( req.user ) {
        res.send( views.createThread(req.user) );
      } else {
        res.send( views.login() );
      }
    } );

    router.post( '/new', function ( req, res ) {
      if ( req.user ) {
        db.createThread( req.user.id, req.body.title ).then( (thread) => {
          db.createMessage(thread.insertId, req.user.id, req.body.message)
          res.redirect( '/' );
        })      
      } else {
        res.redirect( '/' );
      }
    } );

    router.get( '/:slug', function ( req, res ) {
      if ( req.user ) {
        var threadData = [];
        db.getThread( req.params.slug )
          .then( (thread) => {
            if (thread.length !== 0) {
              threadData.push(thread[0])
              return db.getThreadMessages(thread[0].id)
            } else {
              res.send( views.error(404) );
              return
            } 
          })
          .then( (messages) => {
              res.send( views.viewThread(req.user, threadData.pop(), messages) );
            })
          
      } else {
        res.redirect( '/' );
      }
        /*
            TODO
            If there's no user logged in, redirect to login page.
            Retrieve the thread with the slug in `req.params`.
            If none, 404 and show error message.
            Otherwise, get its messages and pass both to `viewThread`.
        */
    } );

    router.post( '/:slug', function ( req, res ) {
        /*
            TODO
            If there's no user logged in, redirect to login page.
            Retrieve the thread with the slug in `req.params`.
            If none, 404 and show error message.
            Otherwise, create a message referencing its ID. (using markdown!)
            If OK, redriect to thread.
            Otherwise, show error.
        */
    } );

    return router;

};
