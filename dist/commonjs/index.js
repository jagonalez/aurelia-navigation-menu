'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;

var _aureliaNavigationMenu = require('./aurelia-navigation-menu');

Object.keys(_aureliaNavigationMenu).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaNavigationMenu[key];
    }
  });
});

var _aureliaRouter = require('aurelia-router');

function configure(config) {
  config.instance(_aureliaNavigationMenu.NavigationMenu, config.container.invoke(_aureliaNavigationMenu.NavigationMenu));
}