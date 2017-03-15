import { PipelineProvider, Router } from 'aurelia-router';
import { NavigationMenu } from './aurelia-navigation-menu';
import { LoadRouteStep } from 'aurelia-router';

export function configure(config) {
  config.instance(NavigationMenu, config.container.invoke(NavigationMenu));
}

export * from './aurelia-navigation-menu';