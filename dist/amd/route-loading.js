define(['exports', 'aurelia-router', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-path', 'aurelia-metadata'], function (exports, _aureliaRouter, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPath, _aureliaMetadata) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.EagerLoadRouteStep = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var EagerLoadRouteStep = exports.EagerLoadRouteStep = function () {
    EagerLoadRouteStep.inject = function inject() {
      return [_aureliaRouter.RouteLoader];
    };

    function EagerLoadRouteStep(routeLoader) {
      _classCallCheck(this, EagerLoadRouteStep);

      console.log('wtf');
      this.routeLoader = routeLoader;
    }

    EagerLoadRouteStep.prototype.run = function run(navigationInstruction, next) {
      return loadNewRoute(this.routeLoader, navigationInstruction).then(next).catch(next.cancel);
    };

    EagerLoadRouteStep.prototype.loadChildRouters = function (_loadChildRouters) {
      function loadChildRouters(_x, _x2, _x3) {
        return _loadChildRouters.apply(this, arguments);
      }

      loadChildRouters.toString = function () {
        return _loadChildRouters.toString();
      };

      return loadChildRouters;
    }(function (router, viewModel, first) {
      return loadChildRouters(router, viewModel, this.routeLoader, first);
    });

    return EagerLoadRouteStep;
  }();

  function loadNewRoute(routeLoader, navigationInstruction) {
    var toLoad = determineWhatToLoad(navigationInstruction);
    var loadPromises = toLoad.map(function (current) {
      return loadRoute(routeLoader, current.navigationInstruction, current.viewPortPlan);
    });

    return Promise.all(loadPromises);
  }

  function determineWhatToLoad(navigationInstruction) {
    var toLoad = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var plan = navigationInstruction.plan;

    for (var viewPortName in plan) {
      var viewPortPlan = plan[viewPortName];

      if (viewPortPlan.strategy === _aureliaRouter.activationStrategy.replace) {
        toLoad.push({ viewPortPlan: viewPortPlan, navigationInstruction: navigationInstruction });

        if (viewPortPlan.childNavigationInstruction) {
          determineWhatToLoad(viewPortPlan.childNavigationInstruction, toLoad);
        }
      } else {
        var viewPortInstruction = navigationInstruction.addViewPortInstruction(viewPortName, viewPortPlan.strategy, viewPortPlan.prevModuleId, viewPortPlan.prevComponent);

        if (viewPortPlan.childNavigationInstruction) {
          viewPortInstruction.childNavigationInstruction = viewPortPlan.childNavigationInstruction;
          determineWhatToLoad(viewPortPlan.childNavigationInstruction, toLoad);
        }
      }
    }

    return toLoad;
  }

  function loadRoute(routeLoader, navigationInstruction, viewPortPlan) {
    var moduleId = viewPortPlan.config.moduleId;

    return loadComponent(routeLoader, navigationInstruction, viewPortPlan.config).then(function (component) {
      var viewPortInstruction = navigationInstruction.addViewPortInstruction(viewPortPlan.name, viewPortPlan.strategy, moduleId, component);

      var childRouter = component.childRouter;
      if (childRouter) {
        var path = navigationInstruction.getWildcardPath();

        return childRouter._createNavigationInstruction(path, navigationInstruction).then(function (childInstruction) {
          viewPortPlan.childNavigationInstruction = childInstruction;

          return (0, _aureliaRouter._buildNavigationPlan)(childInstruction).then(function (childPlan) {
            childInstruction.plan = childPlan;
            viewPortInstruction.childNavigationInstruction = childInstruction;

            return loadNewRoute(routeLoader, childInstruction);
          });
        });
      }

      return undefined;
    });
  }

  function loadComponent(routeLoader, navigationInstruction, config) {
    var router = navigationInstruction.router;
    var lifecycleArgs = navigationInstruction.lifecycleArgs;

    return routeLoader.loadRoute(router, config, navigationInstruction).then(function (component) {
      var viewModel = component.viewModel,
          childContainer = component.childContainer;

      component.router = router;
      component.config = config;

      if ('configureRouter' in viewModel) {
        var childRouter = childContainer.getChildRouter();
        component.childRouter = childRouter;

        return childRouter.configure(function (c) {
          return viewModel.configureRouter.apply(viewModel, [c, childRouter].concat(lifecycleArgs));
        }).then(function () {
          return component;
        });
      }

      return component;
    });
  }

  function createDynamicClass(moduleId) {
    var _dec, _dec2, _class;

    var name = /([^\/^\?]+)\.html/i.exec(moduleId)[1];

    var DynamicClass = (_dec = (0, _aureliaTemplating.customElement)(name), _dec2 = (0, _aureliaTemplating.useView)(moduleId), _dec(_class = _dec2(_class = function () {
      function DynamicClass() {
        _classCallCheck(this, DynamicClass);
      }

      DynamicClass.prototype.bind = function bind(bindingContext) {
        this.$parent = bindingContext;
      };

      return DynamicClass;
    }()) || _class) || _class);


    return DynamicClass;
  }
});