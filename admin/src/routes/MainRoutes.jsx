import { lazy } from 'react';
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ReferenceMgt from 'pages/referenceMgt/reference';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

import OrderManagement from 'pages/orderMgt/index';
import Menu from 'pages/orderMgt/menu'; 
import Order from 'pages/orderMgt/order';
import ComplaintManagement from 'pages/complaintMgt/ComplaintManagement';

const MainRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
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
      path: 'reference-management',
      element: <ReferenceMgt />
    },
    {
      path: 'order-management',
      element: <OrderManagement />
    },
    {
      path: 'menu',
      element: <Menu />
    },
    {
      path: 'order', 
      element: <Order />
    },
    {
      path: 'complaint-management',
      element: <ComplaintManagement />
    }
  ]
};

export default MainRoutes;
