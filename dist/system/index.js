'use strict';

System.register(['aurelia-router', './aurelia-navigation-menu'], function (_export, _context) {
  "use strict";

  var PipelineProvider, Router, NavigationMenu, LoadRouteStep;
  function configure(config) {
    config.instance(NavigationMenu, config.container.invoke(NavigationMenu));
  }

  _export('configure', configure);

  return {
    setters: [function (_aureliaRouter) {
      PipelineProvider = _aureliaRouter.PipelineProvider;
      Router = _aureliaRouter.Router;
      LoadRouteStep = _aureliaRouter.LoadRouteStep;
    }, function (_aureliaNavigationMenu) {
      NavigationMenu = _aureliaNavigationMenu.NavigationMenu;
      var _exportObj = {};

      for (var _key in _aureliaNavigationMenu) {
        if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _aureliaNavigationMenu[_key];
      }

      _export(_exportObj);
    }],
    execute: function () {}
  };
});