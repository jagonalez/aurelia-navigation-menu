'use strict';

System.register(['aurelia-router', './navigation-menu'], function (_export, _context) {
  "use strict";

  var PipelineProvider, Router, NavigationMenu;
  function configure(config) {
    config.instance(NavigationMenu, config.container.invoke(NavigationMenu));
  }

  _export('configure', configure);

  return {
    setters: [function (_aureliaRouter) {
      PipelineProvider = _aureliaRouter.PipelineProvider;
      Router = _aureliaRouter.Router;
    }, function (_navigationMenu) {
      NavigationMenu = _navigationMenu.NavigationMenu;
      var _exportObj = {};
      _exportObj.NavigationMenu = _navigationMenu.NavigationMenu;

      _export(_exportObj);
    }],
    execute: function () {}
  };
});