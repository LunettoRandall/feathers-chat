'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { entity: 'user' };

  return function (hook) {
    if (hook.type !== 'before') {
      throw new Error('The \'restrictToAuthenticated\' hook should only be used as a \'before\' hook.');
    }

    if (hook.params.provider && (0, _lodash2.default)(hook.params, options.entity) === undefined) {
      throw new _feathersErrors2.default.NotAuthenticated('You are not authenticated.');
      // TODO (EK): Add debug log to check to see if the user is populated, if the token was verified and warn appropriately
    }
  };
};

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];