'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _associateCurrentUser = require('./associate-current-user');

var _associateCurrentUser2 = _interopRequireDefault(_associateCurrentUser);

var _queryWithCurrentUser = require('./query-with-current-user');

var _queryWithCurrentUser2 = _interopRequireDefault(_queryWithCurrentUser);

var _restrictToAuthenticated = require('./restrict-to-authenticated');

var _restrictToAuthenticated2 = _interopRequireDefault(_restrictToAuthenticated);

var _restrictToOwner = require('./restrict-to-owner');

var _restrictToOwner2 = _interopRequireDefault(_restrictToOwner);

var _restrictToRoles = require('./restrict-to-roles');

var _restrictToRoles2 = _interopRequireDefault(_restrictToRoles);

var _hasRoleOrRestrict = require('./has-role-or-restrict');

var _hasRoleOrRestrict2 = _interopRequireDefault(_hasRoleOrRestrict);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hooks = {
  associateCurrentUser: _associateCurrentUser2.default,
  queryWithCurrentUser: _queryWithCurrentUser2.default,
  restrictToAuthenticated: _restrictToAuthenticated2.default,
  restrictToOwner: _restrictToOwner2.default,
  restrictToRoles: _restrictToRoles2.default,
  hasRoleOrRestrict: _hasRoleOrRestrict2.default
};

exports.default = hooks;
module.exports = exports['default'];