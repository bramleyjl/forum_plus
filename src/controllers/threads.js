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
        db.createMessage(thread.insertId, req.user.id, markdown.toHTML(req.body.message))
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
          res.send( views.error("404 page not found") );
        } 
      })
      .then( (messages) => {
        res.send( views.viewThread(req.user, threadData.pop(), messages) );
      })
    } else {
      res.redirect( '/' );
    }
  } );

  router.post( '/:slug', function ( req, res ) {
    if ( req.user ) {
      db.getThread( req.params.slug )
      .then( (thread) => {
        if (thread.length !== 0) {
          db.createMessage(thread[0].id, req.user.id, markdown.toHTML(req.body.message))
          .then( (message) => {
            if (message.length !== 0) {
              res.redirect(`/threads${req.path}`)
            } else {
              res.send( views.error("Message not found") );
            }
          })
        } else {
          res.send( views.error("404 page not found") );
        }
      })
    } else {
      res.redirect( '/' );
    }    
  } );

  return router;

};
