import { lazy } from 'react';
import type { Route } from './common/types';

// Main pages
const HomePage = lazy(() => import('./pages/HomePage'));

export const routes: Array<Route> = [
  {
    to: 'home',
    text: 'Home',
    Component: HomePage,
  },
];
