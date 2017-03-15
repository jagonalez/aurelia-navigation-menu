import { PipelineProvider, Router } from 'aurelia-router';
import { NavigationMenu } from './navigation-menu';

export function configure(config) {
  config.instance(NavigationMenu, config.container.invoke(NavigationMenu))
}

export { NavigationMenu } from './navigation-menu'
