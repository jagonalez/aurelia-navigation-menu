# aurelia-navigation-menu plugin

Enables eager loading of child routes and creates a navigation menu based on routes and child routes.
## Installing
Install with npm
`npm install aurelia-navigation-menu --save`

If youre using the CLI add teh dependency

### CLI
```
"dependencies": [
  // ...
  "aurelia-navigation-menu",
  //...
]
```

## Usage

### Eager Loading of Child Routers with a Truthy `nav` property.
**By Default only routes that have `nav` set to true will be eager loaded**
```
configureRouter(config: RouterConfiguration, router: Router) {
  config.options.eagerLoadAll = true;
  config.map([
    { route: ['', 'home'], name: 'home',  moduleId: 'routes/home/index',  nav: true, title: 'Home' },
    { route: 'cats',       name: 'cats',  moduleId: 'routes/cats/index',  nav: true, title: 'Cats' },
    { route: 'dogs',       name: 'dogs',  moduleId: 'routes/dogs/index',  nav: true, title: 'Dogs' },
    { route: 'birds',      name: 'birds', moduleId: 'routes/birds/index', title: 'Birds' }
  ]);
  this.router = router;
}
```
In the above example Home, Cats and Dogs will be checked for a router component.

**If you have nested child routes then you need to add eagerLoadAll to __each__ child  configureRouter function.**

### Eager Load All Child Routers (even with a Falsy or undefined `nav` property)
```
configureRouter(config: RouterConfiguration, router: Router) {
  config.options.eagerLoadAll = true;
  config.options.eagerIgnoreNav = true;
  config.title = 'Child Route Menu Example';
  config.map([
    { route: ['', 'home'], name: 'home',  moduleId: 'routes/home/index', title: 'Home' },
    { route: 'cats',       name: 'cats',  moduleId: 'routes/cats/index', title: 'Cats' },
    { route: 'dogs',       name: 'dogs',  moduleId: 'routes/dogs/index', title: 'Dogs' },
    { route: 'birds',      name: 'birds', moduleId: 'routes/birds/index', nav: true, title: 'Birds' }
  ]);
  this.router = router;
}
```
### Using The Navigation Menu
This plugin add's a navigation property each navigation item within the App Router.
For example using the above code you can get Cat's routes by checking: `router.navigation[1].navigation`

### Ensuring The Navigation Menu Is Loaded

```
import { NavigationMenu } from 'aurelia-navigation-menu';
import { inject } from 'aurelia-dependency-injection';

@inject(NavigationMenu)
export class App {
  constructor(navigationMenu) {
    navigationMenu;
    this.navigationMenu = navigationMenu;
  }
  activate(params) {
    return this.navigationMenu.ensureMenu()
  }
}
```

#### Accessing The Navigation Menu
You can also access the navigation menu from the `NavigationMenu` object/class. In the above example the navigation items will be under: `navigationMenu.menu`

#### Creating A Nestable Menu
1. Create a Custom Element (nav-menu.html)
  ```
  <template bindable="navigation">
    <ul>
      <li repeat.for="row of navigation">
        <a href.bind="row.href" class="${row.isActive ? 'active' : ''}">${row.title}</a>
        <nav-menu if.bind="row.navigation" navigation.bind="row.navigation"></nav-menu>
      </li>
    </ul>
  </template>
  ```
2. Require and refence it in your View (app.html from above example)
  ```
  <require from="resources/elements/nav-menu.html"></require>
  <nav-menu navigation.bind="router.navigation"></nav-menu>

  ```

## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
3. Ensure that [Gulp](http://gulpjs.com/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g gulp
  ```
4. To build the code, you can now run:

  ```shell
  gulp build
  ```
5. You will find the compiled code in the `dist` folder, available in three module formats: AMD, CommonJS and ES6.

6. See `gulpfile.js` for other tasks related to generating the docs and linting.

## Running The Tests

To run the unit tests, first ensure that you have followed the steps above in order to install all dependencies and successfully build the library. Once you have done that, proceed with these additional steps:

1. Ensure that the [Karma](http://karma-runner.github.io/) CLI is installed. If you need to install it, use the following command:

  ```shell
  npm install -g karma-cli
  ```
2. Ensure that [jspm](http://jspm.io/) is installed. If you need to install it, use the following commnand:

  ```shell
  npm install -g jspm
  ```
3. Install the client-side dependencies with jspm:

  ```shell
  jspm install
  ```

4. You can now run the tests with this command:

  ```shell
  karma start
  ```
