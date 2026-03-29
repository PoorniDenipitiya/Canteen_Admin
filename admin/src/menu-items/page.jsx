import { LoginOutlined } from '@ant-design/icons';

const icons = {
  LoginOutlined
};

const pages = {
  id: 'authentication',
  type: 'group',
  children: [
    {
      id: 'login1',
      title: 'Administration',
      type: 'item',
      url: '/register',
      icon: icons.LoginOutlined
    }
  ]
};

export default pages;
