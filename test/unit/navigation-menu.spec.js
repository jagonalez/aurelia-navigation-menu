import {NavigationMenu} from '../../src/navigation-menu';
import { Container } from 'aurelia-dependency-injection'
import { AppRouter } from 'aurelia-router';
import { DOM } from 'aurelia-pal';
import { HtmlBehaviorResource, CompositionEngine } from 'aurelia-templating'
import {metadata} from 'aurelia-metadata';

class MockHistory {
  activate() {}
  deactivate() {}
  navigate() {}
  navigateBack() {}
  getAbsoluteRoot() {
    return absoluteRoot;
  }
}

class MockEventAggregator {
  subscribe(event, handler) {
    return "event";
  }
}
class MockCompositionEngineWithChildren {
  constructor() {
    this.children = 0;
  }
  ensureViewModel(context) {
    context.viewModel = this.children < 1 ? new EagerLoader() : new RouteWithNoChildren();
    context.childContainer.viewModel = context.viewModel;
    this.children++;
    return Promise.resolve(context);
  }
}
class MockCompositionEngine {
  constructor() {
    this.viewModel = new RouteWithNoChildren();
  }
  ensureViewModel(context) {
    context.viewModel = this.viewModel;
    return Promise.resolve(context);
  }
}
class App {
  configureRouter(config) {
    config.map([
      {route: ['','default'], moduleId: 'test', name: "test", nav: true},
      {route: "nowhere", moduleId: "none", name: "ok", nav: false},
      {route: "going", moduleId: "going", name: "gone", nav: true}
    ])
  }
}

class RouteWithNoChildren {
  configureRouter(config) {
    config.map([
      {route: ['','default'], moduleId: 'test', name: "test", nav: true},
      {route: "nowhere", moduleId: "none", name: "ok", nav: false},
      {route: "going", moduleId: "going", name: "gone", nav: true}
    ])
  }
}

class EagerLoader {
  constructor() {
    this.eagerLoadAll = true;
    this.eagerIgnoreNav = false;
  }
  configureRouter(config) {
    config.options.eagerLoadAll = this.eagerLoadAll;
    config.options.eagerIgnoreNav = this.eagerIgnoreNav;

    config.map([
      {route: ['','default'], moduleId: 'test', name: "test", nav: true},
      {route: "nowhere", moduleId: "none", name: "ok", nav: false},
      {route: "going", moduleId: "going", name: "gone", nav: true}
    ])
  }
}


class Child {
  configureRouter(config) {
    config.map([
      {route: ['','default'], moduleId: 'test', name: "test", nav: true, childRouter: true},
    ])
  }
}
describe('the navigaiton menu', () => {
  let navigationMenu;
  let ea;
  let container;
  let router;
  beforeEach( () => {

    container = new Container();
    ea = new MockEventAggregator()
    router = new AppRouter(container, new MockHistory())
    spyOn(DOM, 'addEventListener');
    spyOn(ea, 'subscribe')

    navigationMenu = new NavigationMenu(router, new MockCompositionEngine(), ea, container);


    spyOn(navigationMenu, '_resolveMenuPromise')
    spyOn(navigationMenu, 'loadChildRouters').and.callThrough()
  })

  describe('setup events', () => {

    it('should add an event listener for aurelia composed', () => {
      expect(DOM.addEventListener).toHaveBeenCalledWith("aurelia-composed", jasmine.any(Function));
    })
    it('should subscrive to the aurelia router event', () => {
      expect(ea.subscribe).toHaveBeenCalledWith("router:navigation:complete", jasmine.any(Function));
    })
  });

  describe('configureMenu', () => {
    beforeEach(() => {
      spyOn(navigationMenu, 'updateMenu')
    })
    it ('should call loadchildrouters', (done) => {
      container.root.viewModel = new App()
      navigationMenu.configureMenu()
      .then(() => {
        expect(navigationMenu.loadChildRouters).toHaveBeenCalled();
        done();
      });
    });

    it ('should call create a menu', (done) => {
      spyOn(navigationMenu, 'menu')
      container.root.viewModel = new App()
      navigationMenu.configureMenu()
      .then(() => {
        expect(navigationMenu.menu.length).toEqual(2);
        done();
      });
    });

    it ('should call resolve menu promise', (done) => {
      container.root.viewModel = new App()
      navigationMenu.configureMenu()
      .then(() => {
        expect(navigationMenu._resolveMenuPromise).toHaveBeenCalled();
        done();
      });
    });


  })

  describe('ensureMenu', () => {
    it('should return a promise', () => {
      expect(navigationMenu.ensureMenu()).toEqual(jasmine.any(Promise))
    })
  })

  describe('loadChildRouters', () => {
    beforeEach(() => {
      spyOn(navigationMenu, 'updateMenu')
    })

    it('should configure the router if isConfigured is false', (done) => {
      spyOn(router, "configure").and.callThrough()
      expect(router.isConfigured).toEqual(false);
      navigationMenu.loadChildRouters(router, new App())
      .then((navigation) => {
        expect(router.isConfigured).toEqual(true);
        expect(router.configure).toHaveBeenCalled();
        done();
      })
    })

    it('should not configure the router if isConfigured is true', (done) => {
      spyOn(router, "configure").and.callThrough()
      router.isConfigured = true;
      navigationMenu.loadChildRouters(router, new App())
      .then((navigation) => {
        expect(router.isConfigured).toEqual(true);
        expect(router.configure).not.toHaveBeenCalled();
        done();
      })
    })

    it('should call loadChildRouter if a route has a childRouter property set to true', (done) => {
      spyOn(navigationMenu, 'loadChildRouter').and.callThrough()
      router.container.viewModel = new App();
      navigationMenu.loadChildRouters(router, new Child())
      .then((navigation) => {
        expect(navigationMenu.loadChildRouter).toHaveBeenCalledTimes(1)
        done();
      })
    })

    it('should try to load all nav routes if eagerLoadAll is set to true on the router configuration', (done) => {
      spyOn(navigationMenu, 'loadChildRouter').and.callThrough()
      spyOn(navigationMenu, 'updateNavigationHref').and.callThrough()
      router.container.viewModel = new EagerLoader();
      navigationMenu.loadChildRouters(router, router.container.viewModel)
      .then((navigation) => {
        expect(navigationMenu.loadChildRouter).toHaveBeenCalledTimes(2)
        expect(navigationMenu.updateNavigationHref).toHaveBeenCalledTimes(2)
        done();
      })
    })
    it('should setup all child navigation items', done => {
      spyOn(navigationMenu, 'updateNavigationHref').and.callThrough()
      navigationMenu.compositionEngine = new MockCompositionEngineWithChildren();
      router.container.viewModel = new EagerLoader();
      navigationMenu.loadChildRouters(router, router.container.viewModel)
      .then((navigation) => {
        expect(navigationMenu.updateNavigationHref).toHaveBeenCalledTimes(6)
        done();
      })
    })
    it('should try to load all routes with a childRouter property when eagerIgnoreNav is set to true on the router configuration', (done) => {
      spyOn(navigationMenu, 'loadChildRouter').and.callThrough()
      router.container.viewModel = new EagerLoader();
      router.container.viewModel.eagerIgnoreNav = true;
      router.container.viewModel.eagerLoadAll = false;
      router.addRoute({route: "child", moduleId: 'test', name: "test", nav: true, childRouter: true})
      navigationMenu.loadChildRouters(router, router.container.viewModel)
      .then((navigation) => {
        expect(navigationMenu.loadChildRouter).toHaveBeenCalledTimes(1)
        done();
      })
    })
  })

  describe('updateMenu', () => {
    let instruction;
    beforeEach( (done) => {

      router.container.viewModel = new App();
      navigationMenu.loadChildRouters(router, new Child())
      .then((i) => {
        navigationMenu.menu = i
        router._createNavigationInstruction('default')
        .then(i => {
          instruction = i
          instruction.addViewPortInstruction('default', 'no-change', './test', {});
          router._createNavigationInstruction('default')
          .then(childInstruction => {
            childInstruction.config.navModel.href = 'undefined/'
            childInstruction.addViewPortInstruction('default', 'no-change', './test', {});
            instruction.viewPortInstructions.default.childNavigationInstruction = childInstruction;
            navigationMenu.updateMenu.isSpy = false;
            done();
          })

        })

      })
    })

    it('should update the current navigation menu based on the router instruction', () => {
      navigationMenu.menu[0].isActive = false;
      navigationMenu.updateMenu(instruction, 0)
      expect(navigationMenu.menu[0].isActive).toBe(true);
    })
    
    it('should update any child navigation menu based on the router instruction', () => {
      navigationMenu.menu[0].isActive = false;
      navigationMenu.menu[0].navigation[0].isActive = false;
      navigationMenu.updateMenu(instruction, 0);
      expect(navigationMenu.menu[0].isActive).toBe(true);
      expect(navigationMenu.menu[0].navigation[0].isActive).toBe(true);
    })
  })
});
