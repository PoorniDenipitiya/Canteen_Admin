import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project import
import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from 'components/logo';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  const theme = useTheme();
/*
  return (
    <DrawerHeaderStyled theme={theme} open={!!open}>
      <Logo isIcon={!open} sx={{ width: open ? 'auto' : 35, height: 35 }} />
    </DrawerHeaderStyled>
  );*/

  return (
    <DrawerHeaderStyled theme={theme} open={!!open}>
      <Typography variant="h4" sx={{ fontSize: open ? '3rem' : '1.5rem', fontWeight: 'bold', padding: '16px', fontFamily: 'Brush Script MT, cursive' }}>
        CanTeenz
      </Typography>
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
