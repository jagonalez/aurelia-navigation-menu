import { activationStrategy, _buildNavigationPlan } from 'aurelia-router';
import { Router, RouteLoader } from 'aurelia-router';
import { inject } from 'aurelia-dependency-injection';
import { useView, customElement } from 'aurelia-templating';
import { relativeToFile } from 'aurelia-path';
import { Origin } from 'aurelia-metadata';

export let EagerLoadRouteStep = class EagerLoadRouteStep {
  static inject() {
    return [RouteLoader];
  }

  constructor(routeLoader) {
    console.log('wtf');
    this.routeLoader = routeLoader;
  }

  run(navigationInstruction, next) {
    return loadNewRoute(this.routeLoader, navigationInstruction).then(next).catch(next.cancel);
  }

  loadChildRouters(router, viewModel, first) {
    return loadChildRouters(router, viewModel, this.routeLoader, first);
  }
};

function loadNewRoute(routeLoader, navigationInstruction) {
  let toLoad = determineWhatToLoad(navigationInstruction);
  let loadPromises = toLoad.map(current => loadRoute(routeLoader, current.navigationInstruction, current.viewPortPlan));

  return Promise.all(loadPromises);
}

function determineWhatToLoad(navigationInstruction, toLoad = []) {
  let plan = navigationInstruction.plan;

  for (let viewPortName in plan) {
    let viewPortPlan = plan[viewPortName];

    if (viewPortPlan.strategy === activationStrategy.replace) {
      toLoad.push({ viewPortPlan, navigationInstruction });

      if (viewPortPlan.childNavigationInstruction) {
        determineWhatToLoad(viewPortPlan.childNavigationInstruction, toLoad);
      }
    } else {
      let viewPortInstruction = navigationInstruction.addViewPortInstruction(viewPortName, viewPortPlan.strategy, viewPortPlan.prevModuleId, viewPortPlan.prevComponent);

      if (viewPortPlan.childNavigationInstruction) {
        viewPortInstruction.childNavigationInstruction = viewPortPlan.childNavigationInstruction;
        determineWhatToLoad(viewPortPlan.childNavigationInstruction, toLoad);
      }
    }
  }

  return toLoad;
}

function loadRoute(routeLoader, navigationInstruction, viewPortPlan) {
  let moduleId = viewPortPlan.config.moduleId;

  return loadComponent(routeLoader, navigationInstruction, viewPortPlan.config).then(component => {
    let viewPortInstruction = navigationInstruction.addViewPortInstruction(viewPortPlan.name, viewPortPlan.strategy, moduleId, component);

    let childRouter = component.childRouter;
    if (childRouter) {
      let path = navigationInstruction.getWildcardPath();

      return childRouter._createNavigationInstruction(path, navigationInstruction).then(childInstruction => {
        viewPortPlan.childNavigationInstruction = childInstruction;

        return _buildNavigationPlan(childInstruction).then(childPlan => {
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
  let router = navigationInstruction.router;
  let lifecycleArgs = navigationInstruction.lifecycleArgs;

  return routeLoader.loadRoute(router, config, navigationInstruction).then(component => {
    let { viewModel, childContainer } = component;
    component.router = router;
    component.config = config;

    if ('configureRouter' in viewModel) {
      let childRouter = childContainer.getChildRouter();
      component.childRouter = childRouter;

      return childRouter.configure(c => viewModel.configureRouter(c, childRouter, ...lifecycleArgs)).then(() => component);
    }

    return component;
  });
}

function createDynamicClass(moduleId) {
  var _dec, _dec2, _class;

  let name = /([^\/^\?]+)\.html/i.exec(moduleId)[1];

  let DynamicClass = (_dec = customElement(name), _dec2 = useView(moduleId), _dec(_class = _dec2(_class = class DynamicClass {
    bind(bindingContext) {
      this.$parent = bindingContext;
    }
  }) || _class) || _class);


  return DynamicClass;
}