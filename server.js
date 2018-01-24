'use strict'
let express = require( 'express' );
let bodyParser = require( 'body-parser' );
let cookieParser = require( 'cookie-parser' );
let Database = require( './src/helpers/database.js' );

let config = require( './config.json' );
let IndexController = require( './src/controllers/index.js' );
let ThreadsController = require( './src/controllers/threads.js' );
let UsersController = require( './src/controllers/users.js' );

let views = require( './src/helpers/views.js' );

let app = express();
let db = new Database( config.db );

app.use( bodyParser.urlencoded({ extended: true }) );
app.use( cookieParser() );

app.use( function ( req, res, next ) {
  req.user = null;
  if ( !req.cookies.login_token ) {
    console.error( 'no token exists' );
    return next();
  }
  db.authenticateToken( req.cookies.login_token ).then( ( users ) => {
    if ( !users.length ) {
      console.error( 'no user with that token' );
      return next();
    }
    req.user = users.pop();
    next();
  } );
} );

app.use( '/public', express.static( './public' ) );

app.use( '/', IndexController( db ) );
app.use( '/threads', ThreadsController( db ) );
app.use( '/users', UsersController( db ) );

app.use( ( err, req, res, next ) => {
    /*
        Cough up errors using the errors view.
    */
    res.send( views.error( err.stack ) );
    next( err );
} );

app.listen( {
    port: config.port
}, function () {
    console.log( `Listening on port ${config.port}.` );
} ).on( 'error', function ( err ) {
    if ( err ) {
        console.log( `Couldn't listen on port ${config.port}. (Run as root?)` );
    }
} );
