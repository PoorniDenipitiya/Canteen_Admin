/*
// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Typography',
      type: 'item',
      url: '/typography',
      icon: icons.FontSizeOutlined
    },
    {
      id: 'util-color',
      title: 'Color',
      type: 'item',
      url: '/color',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'util-shadow',
      title: 'Shadow',
      type: 'item',
      url: '/shadow',
      icon: icons.BarcodeOutlined
    }
  ]
};

export default utilities;
*/



// assets
import {
  /*AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined*/
  BookOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  MessageOutlined
} from '@ant-design/icons';

// icons
const icons = {
  /*FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined*/
  BookOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  MessageOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

/*const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-reference',
      title: 'Reference Management',
      type: 'item',
      //url: '/typography',   
     url: '/reference',
      icon: icons.FontSizeOutlined
    },
    {
      id: 'util-color',
      title: 'Order Management',
      type: 'item',
      url: '/color',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'util-shadow',
      title: 'Complaint Management',
      type: 'item',
      url: '/shadow',
      icon: icons.BarcodeOutlined
    },
    {
      id: 'util-shadow',
      title: 'Payment Management',
      type: 'item',
      url: '/shadow',
      icon: icons.BarcodeOutlined
    }
  ]
};*/


const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'referenceManagement',
      title: 'Reference Management',
      type: 'item',
      url: '/reference-management',
      icon: icons.BookOutlined,
      breadcrumbs: false
    },
    {
      id: 'orderManagement',
      title: 'Order Management',
      type: 'item',
      url: '/order-management',
      icon: icons.ShoppingCartOutlined,
      breadcrumbs: false
    },
    {
      id: 'paymentManagement',
      title: 'Payment Management',
      type: 'item',
      url: '/payment-management',
      icon: icons.CreditCardOutlined,
      breadcrumbs: false
    },
    {
      id: 'complaintManagement',
      title: 'Complaint Management',
      type: 'item',
      url: '/complaint-management',
      icon: icons.MessageOutlined,
      breadcrumbs: false
    }
  ]
};

export default utilities;