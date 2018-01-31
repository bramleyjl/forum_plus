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
      return this.query(
        "SELECT\
          `threads`.*,\
          `users`.`name` AS creatorName,\
          COUNT( `messages`.`id` ) AS messageCount\
        FROM `threads`\
        JOIN `users` ON `threads`.`creator` = `users`.`id`\
        JOIN `messages` ON `messages`.`thread` = `threads`.`id`\
        GROUP BY `messages`.`thread`\
        ORDER BY created desc\
        LIMIT ?", [ count ] );
    };

    this.createUser = function ( name ) {
      var newUser = { name: name, created: moment().format('YYYY-MM-DD H:mm:ss') }
      return this.query("INSERT INTO `users` SET ?", [newUser])
    };

    this.createSession = function ( userId ) {
      var newToken = { token: Session.generateToken(), user: userId, created: moment().format('YYYY-MM-DD H:mm:ss') }
      return this.query("INSERT INTO `sessions` SET ?", [newToken])
      .then ( () => {
        return newToken.token;
      })
      .catch( ( err ) => {
        res.send( views.error( err ) );
      })
    };

    this.authenticateToken = function ( token ) {
      return this.query( "\
        SELECT `users`.*\
        FROM `sessions`\
        JOIN `users` ON `users`.`id` = `sessions`.`user`\
        WHERE `sessions`.`token` = ?;\
      ", [ token ] );
    };

    this.getThread = function ( slug ) {
      return this.query("SELECT * FROM `threads` WHERE `slug` = ?", [slug])
    };

    this.getUser = function ( slug ) {
      return this.query("SELECT * FROM `users` WHERE `name` =?", [slug])
    };

    this.getUserMessages = function ( userId ) {
      return this.query(
        "SELECT\
        `messages`.*,\
          `threads`.`title` AS `threadTitle`,\
          `threads`.`slug` AS `threadSlug`\
        FROM `messages`\
        JOIN `threads` ON `messages`.`thread` = `threads`.`id`\
        WHERE `author` =?", [userId] )
    };

    this.getThreadMessages = function ( threadId ) {
      return this.query(
        "SELECT\
          `messages`.*,\
          `users`.`name` AS `authorName`\
        FROM `messages`\
        JOIN `users` ON `messages`.`author` = `users`.`id`\
        WHERE `thread` = ?", [threadId] )
    };

    this.createThread = function ( userId, title ) {
      var newThread = {  
        title : title,
        slug : slug(title),
        creator : userId, 
        created : moment().format('YYYY-MM-DD H:mm:ss'),
        humanTime: moment().format('lll')}
      return this.query("INSERT INTO `threads` SET ?", [newThread])
      .then ( () => {
        return newThread.slug;
      })
      .catch( ( err ) => {
        res.send( views.error( err ) );
      })
    };

    this.createMessage = function ( threadId, authorId, msgBody ) {
      var newMessage = {
        thread : threadId,
        author : authorId,
        created : moment().format('YYYY-MM-DD H:mm:ss'),
        humanTime: moment().format('lll'),
        body : msgBody }
      return this.query("INSERT INTO `messages` SET ?", [newMessage])
    };

    this.getMessageAuthor = function ( messageId ) {
      return this.query("SELECT * FROM `messages` WHERE `id` = ?", [messageId])
    }

    this.deleteMessage = function ( messageId ) {
      var messageThread = this.query(
        "SELECT\
          `messages`.*,\
          `threads`.`slug`\
          FROM `messages`\
          JOIN `threads`\
          ON `messages`.`thread` = `threads`.`id`\
          WHERE `messages`.`id` = ?", [messageId])
      return this.query("DELETE FROM `messages` WHERE `id` = ?", [messageId]).then( () => {
        return messageThread
      })
    };

    this.deleteSessions = function ( userId ) {
      return this.query("DELETE FROM `sessions` WHERE `user` = ?", [userId])
    };

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