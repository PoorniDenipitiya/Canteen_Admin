import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

import dashboard from 'menu-items/dashboard';
import pages from 'menu-items/page';
import utilities from 'menu-items/utilities'; 
import support from 'menu-items/support';


const initialState = {
  openedItem: 'dashboard',
  openedComponent: 'buttons',
  openedHorizontalItem: null,
  isDashboardDrawerOpened: false,
  isComponentDrawerOpened: true
};

export const endpoints = {
  key: 'api/menu',
  master: 'master',
  dashboard: '/dashboard' // server URL
};

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerDrawerOpen(isDashboardDrawerOpened) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isDashboardDrawerOpened };
    },
    false
  );
}

export function handlerActiveItem(openedItem) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, openedItem };
    },
    false
  );
}


//customize side navigation bar based on the user role
export function getMenuItemsByRole(role) {
  const allItems = [
    dashboard,
    pages,
    utilities,
    support
  ];

  switch (role) {
    case 'Admin':
      return allItems;
    /*case 'Medical Officer':
      return [
        dashboard,
        utilities.children.find(item => item.id === 'complaintManagement'),
        support.children.find(item => item.id === 'reports')
      ].filter(Boolean); // Filter out undefined items
    case 'Canteen Owner':
      return [
        dashboard,
        utilities.children.find(item => item.id === 'referenceManagement'),
        utilities.children.find(item => item.id === 'orderManagement'),
        utilities.children.find(item => item.id === 'paymentManagement'),
        support.children.find(item => item.id === 'reports')
      ].filter(Boolean); // Filter out undefined items*/
      case 'Medical Officer':
      return [
        dashboard,
        {
          ...utilities,
          children: utilities.children.filter(item => item.id === 'complaintManagement')
        },
        {
          ...support,
          children: support.children.filter(item => item.id === 'reports')
        }
      ];
    case 'Canteen Owner':
      return [
        dashboard,
        {
          ...utilities,
          children: utilities.children.filter(item => ['referenceManagement', 'orderManagement', 'paymentManagement'].includes(item.id))
        },
        {
          ...support,
          children: support.children.filter(item => item.id === 'reports')
        }
      ];
      default:
      return [];
  }
}