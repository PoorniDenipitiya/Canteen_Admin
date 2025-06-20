// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { getMenuItemsByRole } from 'api/menu';

// project import
import NavGroup from './NavGroup';
//import menuItem from 'menu-items';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const role = localStorage.getItem('userRole');
  const menuItems = getMenuItemsByRole(role);

  const navGroups = menuItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
