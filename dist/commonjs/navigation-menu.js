'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationMenu = undefined;

var _aureliaRouter = require('aurelia-router');

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaTemplating = require('aurelia-templating');

var _aureliaEventAggregator = require('aurelia-event-aggregator');

var _aureliaPath = require('aurelia-path');

var _aureliaMetadata = require('aurelia-metadata');

var _aureliaPal = require('aurelia-pal');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavigationMenu = exports.NavigationMenu = function () {
  NavigationMenu.inject = function inject() {
    return [_aureliaRouter.AppRouter, _aureliaTemplating.CompositionEngine, _aureliaEventAggregator.EventAggregator, _aureliaDependencyInjection.Container];
  };

  function NavigationMenu(appRouter, compositionEngine, eventAggregator, container) {
    var _this = this;

    _classCallCheck(this, NavigationMenu);

    this.appRouter = appRouter;
    this.compositionEngine = compositionEngine;
    this.eventAggregator = eventAggregator;
    this.container = container;
    this.menu = [];
    this._configureMenuPromise = new Promise(function (resolve) {
      _this._resolveMenuPromise = resolve;
    });
    this.setupEvents();
  }

  NavigationMenu.prototype.setupEvents = function setupEvents() {
    var _this2 = this;

    _aureliaPal.DOM.addEventListener('aurelia-composed', function (e) {
      return _this2.configureMenu();
    });
    this.subscriber = this.eventAggregator.subscribe('router:navigation:complete', function (response) {
      _this2.updateMenu(response.instruction, 0);
    });
  };

  NavigationMenu.prototype.configureMenu = function configureMenu() {
    var _this3 = this;

    return this.loadChildRouters(this.appRouter, this.container.root.viewModel).then(function (i) {
      _this3.menu = i;
      _this3.updateMenu(_this3.appRouter.currentInstruction, 0);
      _this3._resolveMenuPromise();
    });
  };

  NavigationMenu.prototype.ensureMenu = function ensureMenu() {
    return this._configureMenuPromise;
  };

  NavigationMenu.prototype.loadChildRouters = function loadChildRouters(router, viewModel) {
    var _this4 = this;

    var promise = router.isConfigured ? Promise.resolve() : router.configure(function (c) {
      return viewModel.configureRouter(c, router);
    });
    return promise.then(function () {
      var eager = router.options.eagerLoadAll || false;
      var ignoreNav = router.options.eagerIgnoreNav || false;

      var routes = router.routes.filter(function (i) {
        if (i.route === "" && router.routes.some(function (r) {
          return r.moduleId === i.moduleId && r.name === i.name;
        })) return false;
        if (eager) return ignoreNav ? true : 'nav' in i && i.nav === true;else return i.childRouter === true ? ignoreNav ? true : 'nav' in i && i.nav === true : false;
      });

      var loads = [];

      routes.forEach(function (route) {
        loads.push(_this4.loadChildRouter(router, route.navModel));
      });

      return Promise.all(loads).then(function () {
        return router.navigation;
      });
    });
  };

  NavigationMenu.prototype.loadChildRouter = function loadChildRouter(router, navModel) {
    var _this5 = this;

    var config = navModel.config;
    var childContainer = router.container.createChild();

    if (/\.html/.test(config.moduleId)) return navModel;

    var viewModel = (0, _aureliaPath.relativeToFile)(config.moduleId, _aureliaMetadata.Origin.get(router.container.viewModel.constructor).moduleId);

    var instruction = {
      viewModel: viewModel,
      childContainer: childContainer,
      view: config.view || config.viewStrategy,
      router: router
    };

    childContainer.getChildRouter = function () {
      var childRouter = void 0;

      childContainer.registerHandler(_aureliaRouter.Router, function (c) {
        return childRouter || (childRouter = router.createChild(childContainer));
      });

      return childContainer.get(_aureliaRouter.Router);
    };

    return this.compositionEngine.ensureViewModel(instruction).then(function (component) {
      var viewModel = component.viewModel,
          childContainer = component.childContainer;


      if ('configureRouter' in viewModel) {
        var childRouter = childContainer.getChildRouter();
        return _this5.loadChildRouters(childRouter, viewModel, false).then(function (i) {
          navModel.navigation = _this5.updateNavigationHref(i, navModel);
          return navModel;
        });
      }
    });
  };

  NavigationMenu.prototype.updateNavigationHref = function updateNavigationHref(navigation, navModel) {
    var _this6 = this;

    navigation.forEach(function (nav) {
      console.log(nav);
      nav.href = _this6.setHref(nav, navModel);
      if (nav.navigation) {
        nav.navigation = _this6.updateNavigationHref(nav.navigation, nav);
      }
    });
    return navigation;
  };

  NavigationMenu.prototype.setHref = function setHref(nav, navModel) {
    var route = void 0;
    if (nav.config.route === '') {
      route = this.findRoute(nav);
    } else {
      route = nav.config.route;
    }
    return navModel.href + '/' + route;
  };

  NavigationMenu.prototype.findRoute = function findRoute(navModel) {
    var route = void 0;
    var routes = navModel.router.routes.filter(function (i) {
      return i.moduleId === navModel.config.moduleId && i.route !== '' && i.name === navModel.config.name && i.title === navModel.config.title;
    });
    if (routes.length !== 0) route = routes[0].route;
    return route || '';
  };

  NavigationMenu.prototype.updateNavModels = function updateNavModels(navModels, instruction, instructionDepth, resetDepth) {
    var _this7 = this;

    navModels.forEach(function (navModel) {

      if (resetDepth >= instructionDepth) navModel.isActive = false;
      if (navModel.href === instruction.config.navModel.href) navModel.isActive = true;else if (navModel.config.route === '' && instruction.config.route !== '') {
        var route = _this7.findRoute(navModel);
        if (navModel.href === '' + instruction.config.navModel.href + route) navModel.isActive = true;
      }
      if (navModel.navigation) {
        _this7.updateNavModels(navModel.navigation, instruction, instructionDepth, resetDepth + 1);
      }
    });
  };

  NavigationMenu.prototype.updateMenu = function updateMenu(instruction, depth) {
    console.log(instruction);
    this.updateNavModels(this.menu, instruction, depth, 0);
    if ('childNavigationInstruction' in instruction.viewPortInstructions.default) {
      this.updateMenu(instruction.viewPortInstructions.default.childNavigationInstruction, depth + 1);
    }
  };

  return NavigationMenu;
}();