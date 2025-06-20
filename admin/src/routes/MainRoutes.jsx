import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ReferenceMgt from 'pages/referenceMgt/reference';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

import OrderManagement from 'pages/orderMgt/index';
import Menu from 'pages/orderMgt/menu'; 
import Order from 'pages/orderMgt/order';
/*const OrderManagement = Loadable(lazy(() => import('pages/orderMgt/index')));
const Menu = Loadable(lazy(() => import('pages/orderMgt/menu')));
const Order = Loadable(lazy(() => import('pages/orderMgt/order')));*/

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'reference-management',
      element: <ReferenceMgt />
    },
    {
      path: 'order-management',
      element: <OrderManagement />
    },
    {
      path: 'menu', // Define the menu route as a standalone route
      element: <Menu />
    },
    {
      path: 'order', // Define the order route as a standalone route
      element: <Order />
    }
  ]
};

export default MainRoutes;
