import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DrawerHeaderStyled from './DrawerHeaderStyled';

export default function DrawerHeader({ open }) {
  const theme = useTheme();

  return (
    <DrawerHeaderStyled theme={theme} open={!!open}>
      <Typography
        variant="h4"
        sx={{ fontSize: open ? '3rem' : '1.5rem', fontWeight: 'bold', padding: '16px', fontFamily: 'Brush Script MT, cursive' }}
      >
        CanTeenz
      </Typography>
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
