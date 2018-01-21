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
      var username = req.body.username
      db.query("SELECT * FROM `users` WHERE `name` = ?", [username] ).then( ( user ) => {
          if ( user === undefined ) {
            //call createSession method
            console.log(user[0].name, user[0].id)
            db.createSession(user[0].id);
          }
          else {
            //call create User method, then create a session using its newly created Id
            db.createUser(req.body.username);
          }
        });
      res.send(views.index());
        /*
            TODO
            Try to find the username named in the POST body.
            If not exists, create them.
            Create a session for them and tuck its `token` into a cookie.
            Redirect to root page.
        */
    } );

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
