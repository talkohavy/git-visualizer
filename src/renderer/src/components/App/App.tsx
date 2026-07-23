import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { BASE_URL } from '@renderer/common/constants';
import RedirectToHome from '@renderer/pages/RedirectToHome';
import { routes } from '@renderer/routes';
import Layout from '../Layout';
import { routeRender } from '../RouteRender';

export default function App() {
  return (
    <Layout>
      <Suspense>
        <Routes>
          <Route path={BASE_URL.substring(1)}>{routes.map(routeRender)}</Route>

          <Route path={'/'}>
            <Route index element={<RedirectToHome />} />
          </Route>
        </Routes>
      </Suspense>
    </Layout>
  );
}
