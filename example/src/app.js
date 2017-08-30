import { NavigationMenu } from 'aurelia-navigation-menu';
import { inject } from 'aurelia-dependency-injection';

@inject(NavigationMenu)
export class App {
  navigationMenu;

  constructor(navigationMenu) {
    this.navigationMenu = navigationMenu;
  }
  activate() {
    this.navigationMenu.ensureMenu()
    .then(() => {
      console.log('ready')
    })
  }
  configureRouter(config: RouterConfiguration, router: Router) {
    config.options.eagerLoadAll = true;
    config.title = 'Child Route Menu Example';
    config.map([
      { route: ['', 'home'], name: 'home',  moduleId: 'routes/home/index',  nav: true, title: 'Home' },
      { route: 'cats',       name: 'cats',  moduleId: 'routes/cats/index',  nav: true, title: 'Cats' },
      { route: 'dogs',       name: 'dogs',  moduleId: 'routes/dogs/index',  nav: true, title: 'Dogs' },
      { route: 'birds',      name: 'birds', moduleId: 'routes/birds/index', nav: true, title: 'Birds' }
    ]);
    this.router = router;
  }
}
