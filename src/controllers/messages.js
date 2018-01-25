'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );

module.exports = function ( db ) {

  var router = express.Router();

  router.get( '/:id', function( req, res ) {
    res.redirect( '/' );
  } )

  router.post( '/:id/delete', function( req, res ) {
    db.getMessageAuthor(req.params.id).then( (userId) => {
      if( userId[0].author === req.user.id ) {
        db.deleteMessage(req.params.id).then( (message) => {
          res.redirect(`/threads/${message[0].slug}`)
        })
      } else {
        res.send( views.error("Can't delete: you are not that message's author!") )
      }
    })
  })

  return router;

}