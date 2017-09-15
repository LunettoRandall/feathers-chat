'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function (hook) {
    if (hook.type !== 'before') {
      throw new Error('The \'restrictToOwner\' hook should only be used as a \'before\' hook.');
    }

    options = Object.assign({}, defaults, hook.app.get('authentication'), options);

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    if (hook.method === 'find' || hook.id === null) {
      return (0, _queryWithCurrentUser2.default)({
        idField: options.idField,
        as: options.ownerField
      })(hook);
    }

    // Check hook is being called on an allowable method
    if (!(hook.method === 'get' || hook.method === 'update' || hook.method === 'patch' || hook.method === 'remove')) {
      throw new _feathersErrors2.default.MethodNotAllowed('The \'restrictToOwner\' hook should only be used on the \'get\', \'update\', \'patch\' and \'remove\' service methods.');
    }

    if (!hook.params.user) {
      // TODO (EK): Add a debugger call to remind the dev to check their hook chain
      // as they probably don't have the right hooks in the right order.
      throw new _feathersErrors2.default.NotAuthenticated('The current user is missing. You must not be authenticated.');
    }

    var id = (0, _lodash4.default)(hook.params.user, options.idField);

    if (id === undefined) {
      throw new Error('\'' + options.idField + ' is missing from current user.\'');
    }

    // look up the document and throw a Forbidden error if the user is not an owner
    // Set provider as undefined so we avoid an infinite loop if this hook is
    // set on the resource we are requesting.
    var params = Object.assign({}, hook.params, { provider: undefined });

    return hook.service.get(hook.id, params).then(function (data) {
      if (data.toJSON) {
        data = data.toJSON();
      } else if (data.toObject) {
        data = data.toObject();
      }

      var field = (0, _lodash4.default)(data, options.ownerField);

      // Handle nested Sequelize or Mongoose models
      if ((0, _lodash2.default)(field)) {
        field = field[options.idField];
      }

      if (Array.isArray(field)) {
        var fieldArray = field.map(function (idValue) {
          return idValue.toString();
        });
        if (fieldArray.length === 0 || fieldArray.indexOf(id.toString()) < 0) {
          throw new _feathersErrors2.default.Forbidden('You do not have the permissions to access this.');
        }
      } else if (field === undefined || field.toString() !== id.toString()) {
        throw new _feathersErrors2.default.Forbidden('You do not have the permissions to access this.');
      }

      return hook;
    });
  };
};

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _lodash = require('lodash.isplainobject');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.get');

var _lodash4 = _interopRequireDefault(_lodash3);

var _queryWithCurrentUser = require('./query-with-current-user');

var _queryWithCurrentUser2 = _interopRequireDefault(_queryWithCurrentUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  idField: '_id',
  ownerField: 'userId'
};

module.exports = exports['default'];