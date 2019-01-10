'use strict';

System.register(['aurelia-router', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-event-aggregator', 'aurelia-path', 'aurelia-metadata', 'aurelia-pal'], function (_export, _context) {
  "use strict";

  var AppRouter, Router, inject, Container, CompositionEngine, EventAggregator, relativeToFile, Origin, DOM, NavigationMenu;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaRouter) {
      AppRouter = _aureliaRouter.AppRouter;
      Router = _aureliaRouter.Router;
    }, function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
      Container = _aureliaDependencyInjection.Container;
    }, function (_aureliaTemplating) {
      CompositionEngine = _aureliaTemplating.CompositionEngine;
    }, function (_aureliaEventAggregator) {
      EventAggregator = _aureliaEventAggregator.EventAggregator;
    }, function (_aureliaPath) {
      relativeToFile = _aureliaPath.relativeToFile;
    }, function (_aureliaMetadata) {
      Origin = _aureliaMetadata.Origin;
    }, function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
    }],
    execute: function () {
      _export('NavigationMenu', NavigationMenu = function () {
        NavigationMenu.inject = function inject() {
          return [AppRouter, CompositionEngine, EventAggregator, Container];
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

          DOM.addEventListener('aurelia-composed', function (e) {
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

          var viewModel = relativeToFile(config.moduleId, Origin.get(router.container.viewModel.constructor).moduleId);

          var instruction = {
            viewModel: viewModel,
            childContainer: childContainer,
            view: config.view || config.viewStrategy,
            router: router
          };

          childContainer.getChildRouter = function () {
            var childRouter = void 0;

            childContainer.registerHandler(Router, function (c) {
              return childRouter || (childRouter = router.createChild(childContainer));
            });

            return childContainer.get(Router);
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
          this.updateNavModels(this.menu, instruction, depth, 0);

          var viewPortName = 'default';
          for (var name in instruction.viewPortInstructions) {
            if (instruction.viewPortInstructions.hasOwnProperty(name)) {
              viewPortName = name;
              break;
            }
          }
          var viewPortInstructions = instruction.viewPortInstructions[viewPortName];
          if (viewPortInstructions && 'childNavigationInstruction' in viewPortInstructions) {
            this.updateMenu(instruction.viewPortInstructions.default.childNavigationInstruction, depth + 1);
          }
        };

        return NavigationMenu;
      }());

      _export('NavigationMenu', NavigationMenu);
    }
  };
});