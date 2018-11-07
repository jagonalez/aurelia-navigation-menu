import {AppRouter, Router} from 'aurelia-router';
import {inject, Container} from 'aurelia-dependency-injection';
import {CompositionEngine} from 'aurelia-templating';
import {EventAggregator} from 'aurelia-event-aggregator';
import {relativeToFile} from 'aurelia-path';
import {Origin} from 'aurelia-metadata';
import {DOM} from 'aurelia-pal';

export class NavigationMenu {

  static inject() { return [AppRouter, CompositionEngine, EventAggregator, Container] }

  constructor(appRouter: AppRouter, compositionEngine: CompositionEngine, eventAggregator: EventAggregator, container: Container) {
    this.appRouter = appRouter;
    this.compositionEngine = compositionEngine;
    this.eventAggregator = eventAggregator;
    this.container = container;
    this.menu = [];
    this._configureMenuPromise = new Promise(resolve => { this._resolveMenuPromise = resolve })
    this.setupEvents();
  }

  setupEvents() {
    DOM.addEventListener('aurelia-composed', e => this.configureMenu())
    this.subscriber = this.eventAggregator.subscribe('router:navigation:complete', response => { this.updateMenu(response.instruction, 0) })
  }

  configureMenu() {
    return this.loadChildRouters(this.appRouter, this.container.root.viewModel)
    .then(i => {
      this.menu = i
      this.updateMenu(this.appRouter.currentInstruction, 0)
      this._resolveMenuPromise()
    })
  }

  ensureMenu() {
    return this._configureMenuPromise;
  }

  loadChildRouters(router, viewModel) {
    let promise = router.isConfigured ? Promise.resolve() : router.configure(c => viewModel.configureRouter(c, router))
    return promise
      .then(() => {
        let eager = router.options.eagerLoadAll || false;
        let ignoreNav = router.options.eagerIgnoreNav || false;

        let routes = router.routes.filter(i => {
          if (i.route === "" && router.routes.some(r => r.moduleId === i.moduleId && r.name === i.name))
            return false;
          if (eager)
            return ignoreNav ? true : 'nav' in i && i.nav === true;
          else
            return i.childRouter === true ? (ignoreNav ? true : 'nav' in i && i.nav === true) : false;
        })

        let loads = []

        routes.forEach(route => {
          loads.push(this.loadChildRouter(router, route.navModel));
        })

        return Promise.all(loads)
        .then(() => router.navigation)
      })
  }

  loadChildRouter(router, navModel) {
    let config = navModel.config;
    let childContainer = router.container.createChild();

    if (/\.html/.test(config.moduleId))
      return navModel;

    let viewModel = relativeToFile(config.moduleId, Origin.get(router.container.viewModel.constructor).moduleId);

    let instruction = {
      viewModel: viewModel,
      childContainer: childContainer,
      view: config.view || config.viewStrategy,
      router: router
    };

    childContainer.getChildRouter = function() {
      let childRouter;

      childContainer.registerHandler(Router, c => {
        return childRouter || (childRouter = router.createChild(childContainer));
      });

      return childContainer.get(Router);
    };

    return this.compositionEngine.ensureViewModel(instruction)
    .then(component => {
      let {viewModel, childContainer} = component;

      if ('configureRouter' in viewModel) {
        let childRouter = childContainer.getChildRouter();
        return this.loadChildRouters(childRouter, viewModel, false)
        .then(i => {
          navModel.navigation = this.updateNavigationHref(i, navModel)
          return navModel;
         })
      }
    })
  }

  updateNavigationHref(navigation, navModel) {
    navigation.forEach(nav => {
      nav.href = this.setHref(nav, navModel);
      if (nav.navigation) {
        nav.navigation = this.updateNavigationHref(nav.navigation, nav);
      }
    })
    return navigation;
  }

  setHref(nav, navModel) {
    let route;
    if (nav.config.route === '') {
      route = this.findRoute(nav);
    } else {
      route = nav.config.route;
    }
    return `${navModel.href}/${route}`;
  }

  findRoute(navModel) {
    let route;
    let routes = navModel.router.routes.filter(i => i.moduleId === navModel.config.moduleId && i.route !== '' && i.name === navModel.config.name && i.title === navModel.config.title);
    if (routes.length !== 0)
      route = routes[0].route;
    return route || '';
  }

  updateNavModels(navModels, instruction, instructionDepth, resetDepth) {

    navModels.forEach(navModel => {
      
      if (resetDepth >= instructionDepth)
        navModel.isActive = false;
      if (navModel.href === instruction.config.navModel.href)
        navModel.isActive = true;
      else if (navModel.config.route === '' && instruction.config.route !== '') {
        let route = this.findRoute(navModel)
        if (navModel.href === `${instruction.config.navModel.href}${route}`) 
          navModel.isActive = true;    
      }
      if (navModel.navigation) {
        this.updateNavModels(navModel.navigation, instruction, instructionDepth, resetDepth+1)
      }
    })
  }

  updateMenu(instruction, depth) {
    this.updateNavModels(this.menu, instruction, depth, 0);
	
	let viewPortName = 'default';
	for(let name in instruction.viewPortInstructions) {
	  if(instruction.viewPortInstructions.hasOwnProperty(name)) {
		viewPortName = name;
		break;
	  }
	}
    if ('childNavigationInstruction' in instruction.viewPortInstructions[viewPortName]) {
      this.updateMenu(instruction.viewPortInstructions.default.childNavigationInstruction, depth+1);
    }
  }

}
