'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );
let humanTime = require( 'human-time' );
let markdown = require( 'markdown' ).markdown;

module.exports = function ( db ) {

    var router = express.Router();

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
          console.log(thread)
        })      
      } else {
        res.send( views.login() );
      }
    } );

    router.get( '/:slug', function ( req, res ) {
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
