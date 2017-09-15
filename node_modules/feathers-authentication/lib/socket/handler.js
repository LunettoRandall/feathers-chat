'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = setupSocketHandler;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _ms = require('ms');

var _ms2 = _interopRequireDefault(_ms);

var _utils = require('feathers-socket-commons/lib/utils');

var _longTimeout = require('long-timeout');

var _longTimeout2 = _interopRequireDefault(_longTimeout);

var _updateEntity = require('./update-entity');

var _updateEntity2 = _interopRequireDefault(_updateEntity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var debug = (0, _debug2.default)('feathers-authentication:sockets:handler');

function handleSocketCallback(promise, callback) {
  if (typeof callback === 'function') {
    promise.then(function (data) {
      return callback(null, data);
    }).catch(function (error) {
      debug('Socket authentication error', error);
      callback((0, _utils.normalizeError)(error));
    });
  }

  return promise;
}

function setupSocketHandler(app, options, _ref) {
  var feathersParams = _ref.feathersParams,
      provider = _ref.provider,
      emit = _ref.emit,
      disconnect = _ref.disconnect;

  var authSettings = app.get('authentication') || app.get('auth');
  var service = app.service(authSettings.path);
  var entityService = app.service(authSettings.service);
  var isUpdateEntitySetup = false;

  return function (socket) {
    var logoutTimer = void 0;

    var logout = function logout() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      var connection = feathersParams(socket);
      var accessToken = connection.accessToken;


      if (accessToken) {
        debug('Logging out socket with accessToken', accessToken);

        delete connection.accessToken;
        delete connection.authenticated;
        connection.headers = {};
        socket._feathers.body = {};

        var promise = service.remove(accessToken, { authenticated: true }).then(function (tokens) {
          debug('Successfully logged out socket with accessToken', accessToken);

          app.emit('logout', tokens, {
            provider: provider,
            socket: socket,
            connection: connection
          });

          return tokens;
        });

        handleSocketCallback(promise, callback);
      } else if (typeof callback === 'function') {
        return callback(null, {});
      }
    };

    var authenticate = function authenticate() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      if (typeof data === 'function') {
        callback = data;
      }

      if (typeof data === 'function' || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || data === null) {
        data = {};
      }

      var _data = data,
          strategy = _data.strategy;

      socket._feathers = Object.assign({
        query: {},
        provider: 'socketio',
        headers: {},
        session: {},
        cookies: {}
      }, feathersParams(socket));

      var strategyOptions = app.passport.options(strategy);

      var promise = service.create(data, socket._feathers).then(function (tokens) {
        if (socket._feathers.authenticated) {
          // Add the auth strategy response data and tokens to the socket connection
          // so that they can be referenced in the future. (ie. attach the user)
          var connection = feathersParams(socket);
          var headers = _defineProperty({}, authSettings.header, tokens.accessToken);
          var result = _defineProperty({
            payload: socket._feathers.payload
          }, strategyOptions.entity, socket._feathers[strategyOptions.entity]);

          connection = Object.assign(connection, result, tokens, { headers: headers, authenticated: true });

          app.emit('login', tokens, {
            provider: provider,
            socket: socket,
            connection: connection
          });
        }

        // Clear any previous timeout if we have logged in again.
        if (logoutTimer) {
          debug('Clearing old timeout.');
          _longTimeout2.default.clearTimeout(logoutTimer);
        }

        logoutTimer = _longTimeout2.default.setTimeout(function () {
          debug('Token expired. Logging out.');
          logout();
        }, (0, _ms2.default)(authSettings.jwt.expiresIn));

        // TODO (EK): Setup and tear down socket listeners to keep the entity
        // up to date that should be attached to the socket. Need to get the
        // entity or assignProperty
        //
        // Remove old listeners to prevent leaks
        // socket.off('users updated');
        // socket.off('users patched');
        // socket.off('users removed');

        // Register new event listeners
        // socket.on('users updated', data => {
        //   if (data.id === id) {
        //     let connection = feathersParams(socket);
        //     connection.user = data;
        //   }
        // });

        // socket.on('users patched', data => {
        //   if (data.id === id) {
        //     let connection = feathersParams(socket);
        //     connection.user = data;
        //   }
        // });

        // socket.on('users removed', data => {
        //   if (data.id === id) {
        //     logout();
        //   }
        // });

        return Promise.resolve(tokens);
      });

      handleSocketCallback(promise, callback);
    };

    socket.on('authenticate', authenticate);
    socket.on(disconnect, logout);
    socket.on('logout', logout);

    // Only bind the handlers on receiving the first socket connection.
    if (!isUpdateEntitySetup) {
      isUpdateEntitySetup = true;
      entityService.on('updated', (0, _updateEntity2.default)(app));
      entityService.on('patched', (0, _updateEntity2.default)(app));
    }
  };
}
module.exports = exports['default'];