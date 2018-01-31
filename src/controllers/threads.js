  'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );
let humanTime = require( 'human-time' );
let moment = require('moment');
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
    var threadData = []
    if ( req.user ) {
      if (req.body.title === '') {
        res.send( views.createThread(req.user, "Your thread needs a title!"))
      } else if (req.body.message === '') {
        res.send( views.createThread(req.user, "Your thread needs a message!"))
      } else {
        db.createThread( req.user.id, req.body.title )
        .then( (thread) => {
          threadData.push(thread)
          return db.getThread(threadData[0])      
        })
        .then( (thread) => {
          return db.createMessage(thread[0].id, req.user.id, markdown.toHTML(req.body.message))
        })
        .then ( (message) => {
          res.redirect( `/threads/${threadData.pop()}`)
        })
      }      
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
          res.send( views.error("This thread doesn't appear to exist.") );
        } 
      })
      .then( (messages) => {
        for (var i in messages) {
          if (messages[i]['author'] === req.user.id) {
            messages[i]['delete'] = true;
          }
          messages[i]['humanTime'] = moment(messages[i]['created']).fromNow();
        }
        res.send( views.viewThread(req.user, threadData.pop(), messages) );
      })
    } else {
      res.redirect( '/' );
    }
  } );

  router.post( '/:slug', function ( req, res ) {
    if ( req.user ) {
      if (req.body.message === '') {
        var threadData = [];
        db.getThread( req.params.slug )
        .then( (thread) => {
          if (thread.length !== 0) {
            threadData.push(thread[0])
            return db.getThreadMessages(thread[0].id)
          } else {
            res.send( views.error("This thread doesn't appear to exist.") );
          } 
        })
        .then( (messages) => {
          res.send( views.viewThread(req.user, threadData.pop(), messages,
            "Your message cannot be empty!") );
        })
      } else {
        db.getThread( req.params.slug )
        .then( (thread) => {
          if (thread.length !== 0) {
            db.createMessage(thread[0].id, req.user.id, markdown.toHTML(req.body.message))
            .then( (message) => {
              if (message.length !== 0) {
                res.redirect(`/threads${req.path}`)
              } else {
                res.send( views.error("Message creation unsuccessful.") );
              }
            })
          } else {
            res.send( views.error("This thread doesn't appear to exist.") );
          }
        })
      }
    } else {
      res.redirect( '/' );
    }    
  } );

  return router;

};
