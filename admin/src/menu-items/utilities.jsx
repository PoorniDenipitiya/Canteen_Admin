import { BookOutlined, ShoppingCartOutlined, CreditCardOutlined, MessageOutlined } from '@ant-design/icons';

const icons = {
  BookOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  MessageOutlined
};

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
