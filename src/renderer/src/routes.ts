import { lazy } from 'react';
import type { Route } from './common/types';

// Main pages
const HomePage = lazy(() => import('./pages/HomePage'));
const GitVisualizerPage = lazy(() => import('./pages/GitVisualizer'));

export const routes: Array<Route> = [
  {
    to: 'home',
    text: 'Home',
    Component: HomePage,
  },
  {
    to: 'git-visualizer',
    text: 'Git Visualizer',
    Component: GitVisualizerPage,
  },
];
