'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationMenu = undefined;
exports.configure = configure;

var _navigationMenu = require('./navigation-menu');

Object.defineProperty(exports, 'NavigationMenu', {
  enumerable: true,
  get: function get() {
    return _navigationMenu.NavigationMenu;
  }
});

var _aureliaRouter = require('aurelia-router');

function configure(config) {
  config.instance(_navigationMenu.NavigationMenu, config.container.invoke(_navigationMenu.NavigationMenu));
}