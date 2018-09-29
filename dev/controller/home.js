'use strict';

import { Controller } from 'egg'
import GetMapping from '../decorators/GetMapping'

class HomeController extends Controller {
  @GetMapping({
    name: 'id',
    type: Number,
  }, {
    name: 'name',
    type: String,
  }, {
    name: 'right',
    type: Boolean,
  }, {
    name: 'list',
    type: Array,
  })
  async index(id, name, right, list) {
    this.ctx.body = {
      code: 200,
      content: { id, name, right, list },
    };
  }
}

export default HomeController;