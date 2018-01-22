'use strict';
let mysql = require( 'mysql' );
let slug = require( 'slug' );
let moment = require('moment');

let User = require( '../models/user.js' );
let Session = require( '../models/session.js' );
let Message = require( '../models/message.js' );
let Thread = require( '../models/thread.js' );

module.exports = function ( opts ) {

    let cxn = mysql.createConnection({
        host     : opts.host,
        port     : opts.port,
        user     : opts.user,
        password : opts.pass,
        database : opts.database
    });

    /*
        Connect immediately upon instantiation.
    */

    cxn.connect ( function ( err ) {
        if ( err )
            throw new Error( "Couldn't connect to database." )
        console.log( "Connected to database." );
    } );

    /*
        "Promisified" `query()`.
        (You may use `cxn.query()` directly, if you'd like.)
    */
    this.query = function ( query, binds ) {
        return new Promise( ( resolve, reject ) => {
            cxn.query( query, binds, ( err, results, fields ) => {
                err ? reject( err ) : resolve( results, fields );
            } );
        } );
    };

    this.getRecentThreads = function ( count ) {
        /*
            TODO
            Get the `count` most-recent `thread`s, as well as each of their
            author's names and an aggregate `count()` of how many messages
            it has.
        */
    };

    this.createUser = function ( name ) {
      var newUser = { name: name, created: moment().format('YYYY-MM-DD H:mm:ss') }
      cxn.query("INSERT INTO `users` SET ?", [newUser], ( err, results ) => {
        if (err) throw err;
      })
    };

    this.createSession = function ( userId ) {
      var newToken = { token: Session.generateToken(), user: userId, created: moment().format('YYYY-MM-DD H:mm:ss') }
      return cxn.query("INSERT INTO `sessions` SET ?", [newToken], ( err, results ) => {
        if (err) throw err;
        return (results.insertId)
      });
    };

    this.findUser = function ( name ) {
        /*
            TODO
            Get a user by name.
            Always return just one (or none).
        */
    };

    this.authenticateToken = function ( token ) {
        /*
            TODO
            Given a token, return the user its associated with, or nothing if
            it doesn't exist.
        */
    };

    this.getThread = function ( slug ) {
        /*
            TODO
            Retrieve a thread by slug.
        */
    };

    this.getUser = function ( slug ) {
        /*
            TODO
            Retrieve a user by slug.
        */
    };

    this.getUserMessages = function ( userId ) {
        /*
            TODO
            Retrieve a list of messages belonging to a particular user,
            but also including the names and slugs of the threads each belongs
            to.
        */
    };

    this.getThreadMessages = function ( threadId ) {
        /*
            TODO
            Retrieve a list of messages belonging to a particular thread,
            but also including the names of each message's author.
        */
    };

    this.createThread = function ( userId, title ) {
        /*
            TODO
            Insert a row into the `threads` table.
        */
    };

    this.createMessage = function ( threadId, authorId, msgBody ) {
        /*
            TODO
            Insert a row into the `messages` table.
        */
    };

    this.deleteSessions = function ( userId ) {
        /*
            TODO
            Delete all sessions for a user.
        */
    }

    this.disconnect = function ( callback ) {
        cxn.end( callback );
    };

    /*
        Common SQL error codes:
            1452 FKC violation
            1062 unique violation
            1406 too long
            1364 not null, no default
    */

};