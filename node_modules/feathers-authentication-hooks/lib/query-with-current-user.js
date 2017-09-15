'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function (hook) {
    if (hook.type !== 'before') {
      throw new Error('The \'queryWithCurrentUser\' hook should only be used as a \'before\' hook.');
    }

    if (!hook.params.user) {
      if (!hook.params.provider) {
        return hook;
      }

      throw new Error('There is no current user to associate.');
    }

    options = Object.assign({}, defaults, hook.app.get('authentication'), options);

    var id = (0, _lodash2.default)(hook.params.user, options.idField);

    if (id === undefined) {
      throw new Error('Current user is missing \'' + options.idField + '\' field.');
    }

    (0, _lodash4.default)(hook.params, 'query.' + options.as, id);
  };
};

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.set');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  idField: '_id',
  as: 'userId'
};

module.exports = exports['default'];