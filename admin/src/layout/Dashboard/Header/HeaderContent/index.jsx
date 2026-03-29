import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
      {downLG && <Box sx={{ flexGrow: 1 }} />}
      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </Box>
  );
}
