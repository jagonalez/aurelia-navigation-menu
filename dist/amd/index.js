define(['exports', './aurelia-navigation-menu', 'aurelia-router'], function (exports, _aureliaNavigationMenu, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  Object.keys(_aureliaNavigationMenu).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _aureliaNavigationMenu[key];
      }
    });
  });
  function configure(config) {
    config.instance(_aureliaNavigationMenu.NavigationMenu, config.container.invoke(_aureliaNavigationMenu.NavigationMenu));
  }
});