#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./app');
var https = require('https');
var http = require('http');
var config = require('./config')();
var fs = require('fs');

/**
 * Get port from environment and store in Express.
 */

var port = config.port;
app.set('port', port);

/**
 * Create the server
 * 
 * If on Dev, Configure the SSL key, too
 */
let server = null;
if (process.env.NODE_ENV === 'development') {
  let options = {};
  options.key = fs.readFileSync( 'dev-key.pem' );
  options.cert = fs.readFileSync( 'dev-cert.crt' );
  options.rejectUnauthorized = false;

  console.log("Dev HTTPS ready");
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
