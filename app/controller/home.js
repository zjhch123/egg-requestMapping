'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _desc, _value, _class;

var _egg = require('egg');

var _GetMapping = require('../decorators/GetMapping');

var _GetMapping2 = _interopRequireDefault(_GetMapping);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let HomeController = (_dec = (0, _GetMapping2.default)({
  name: 'id',
  type: Number
}, {
  name: 'name',
  type: String
}, {
  name: 'right',
  type: Boolean
}, {
  name: 'list',
  type: Array
}), (_class = class HomeController extends _egg.Controller {
  async index(id, name, right, list) {
    this.ctx.body = {
      code: 200,
      content: { id, name, right, list }
    };
  }
}, (_applyDecoratedDescriptor(_class.prototype, 'index', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'index'), _class.prototype)), _class));
exports.default = HomeController;