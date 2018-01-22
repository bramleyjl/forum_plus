'use strict';
let express = require( 'express' );
let views = require( '../helpers/views.js' );
let humanTime = require( 'human-time' );
let markdown = require( 'markdown' ).markdown;

module.exports = function ( db ) {

    var router = express.Router();

    router.get( '/', function ( req, res ) {
      res.send( views.login() );
        /*
            TODO
            If no user logged in, show `login` view.
            Otherwise, get recent threads and pass to `index` view.
        */
    } );

    router.post( '/login', function ( req, res ) {

      db.query("SELECT * FROM `users` WHERE `name` = ?", [req.body.username])
      .then( (user) => {
        return user
      })
      .then( (user) => {
        console.log(user)
        return db.createSession(user[0].id) 
      })
      .then ( (session) => {
        console.log(session.values[0].user, session.values[0].token)
      })
      .catch( (err) => {
        console.log("Error: " + err);
      } )

      res.send(views.index());
        /*
            TODO
            Try to find the username named in the POST body.
            If not exists, create them.
            Create a session for them and tuck its `token` into a cookie.
            Redirect to root page.
        */
    });

    router.get( '/logout', function ( req, res ) {
      db.createUser("John");
      res.send(views.index());
        /*
            TODO
            Clear the session cookie.
            Delete all of this user's sessions.
            Redirect to login page.
        */
    } );

    return router;

};
