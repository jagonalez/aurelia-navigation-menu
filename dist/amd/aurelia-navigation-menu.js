define(['exports', './navigation-menu', 'aurelia-router'], function (exports, _navigationMenu, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NavigationMenu = undefined;
  exports.configure = configure;
  Object.defineProperty(exports, 'NavigationMenu', {
    enumerable: true,
    get: function () {
      return _navigationMenu.NavigationMenu;
    }
  });
  function configure(config) {
    config.instance(_navigationMenu.NavigationMenu, config.container.invoke(_navigationMenu.NavigationMenu));
  }
});