'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('feathers:configuration');
var config = require('config');
var separator = _path2.default.sep;

exports.default = module.exports = function () {
  return function () {
    var app = this;

    var convert = function convert(current) {
      var result = Array.isArray(current) ? [] : {};

      Object.keys(current).forEach(function (name) {
        var value = current[name];

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
          value = convert(value);
        }

        if (typeof value === 'string') {
          if (value.indexOf('\\') === 0) {
            value = value.replace('\\', '');
          } else {
            if (process.env[value]) {
              value = process.env[value];
            } else if (value.indexOf('.') === 0 || value.indexOf('..') === 0) {
              // Make relative paths absolute
              value = _path2.default.resolve(_path2.default.join(config.util.getEnv('NODE_CONFIG_DIR')), value.replace(/\//g, separator));
            }
          }
        }

        result[name] = value;
      });

      return result;
    };

    var env = config.util.getEnv('NODE_ENV');
    debug('Initializing configuration for ' + env + ' environment');
    var conf = convert(config);

    if (!app) {
      return conf;
    }

    Object.keys(conf).forEach(function (name) {
      var value = conf[name];
      debug('Setting ' + name + ' configuration value to', value);
      app.set(name, value);
    });
  };
};