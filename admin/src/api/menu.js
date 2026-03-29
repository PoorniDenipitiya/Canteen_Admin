//Central menu mgt system with global state mgt
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import dashboard from 'menu-items/dashboard';
import pages from 'menu-items/page';
import utilities from 'menu-items/utilities';

const initialState = {
  openedItem: 'dashboard',
  isDashboardDrawerOpened: false
};

export const endpoints = {
  key: 'api/menu',
  master: 'master'
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
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isDashboardDrawerOpened };
    },
    false
  );
}

export function handlerActiveItem(openedItem) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, openedItem };
    },
    false
  );
}

export function getMenuItemsByRole(role) {
  switch (role) {
    case 'Admin':
      return [
        dashboard,
        pages,
        {
          ...utilities,
          children: utilities.children.filter((item) => !['paymentManagement', 'orderManagement'].includes(item.id))
        }
      ];
    case 'Medical Officer':
      return [
        dashboard,
        {
          ...utilities,
          children: utilities.children.filter((item) => item.id === 'complaintManagement')
        }
      ];
    case 'Canteen Owner':
      return [
        dashboard,
        {
          ...utilities,
          children: utilities.children.filter((item) => ['referenceManagement', 'orderManagement'].includes(item.id))
        }
      ];
    default:
      return [];
  }
}
