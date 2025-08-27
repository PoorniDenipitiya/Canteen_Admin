import axios from 'axios';
import config from '../../../../config/appConfig';
import React, { useEffect, useState, useRef } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import NotificationBell from 'components/NotificationBell';

// project import
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',

  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //


export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('adminReadNotificationIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'Admin') {
      const fetchComplaints = async () => {
        try {
          const res = await axios.get(`${config.api_base_urls.user}/api/complaints/all`, { withCredentials: true });
          const complaints = Array.isArray(res.data) ? res.data : [];
          setNotifications(complaints);
          // Only count unread
          setCount(complaints.filter(c => !readIds.includes(c._id || c.id)).length);
        } catch (err) {
          setNotifications([]);
          setCount(0);
        }
      };
      fetchComplaints();
      const interval = setInterval(fetchComplaints, 2000);
      return () => clearInterval(interval);
    } else {
      // Canteen Owner logic (existing)
      const fetchOrderPlaced = async () => {
        try {
          const canteenName = localStorage.getItem('canteenName') || '';
          if (!canteenName) {
            setNotifications([]);
            setCount(0);
            return;
          }
          const res = await axios.get(`${config.api_base_urls.user}/api/admin/orders?canteenName=${canteenName}`);
          const orders = Array.isArray(res.data) ? res.data : [];
          const placedOrders = orders.filter(o => o.status === 'order placed');
          setNotifications(placedOrders);
          setCount(placedOrders.length);
        } catch (err) {
          setNotifications([]);
          setCount(0);
        }
      };
      fetchOrderPlaced();
      const interval = setInterval(fetchOrderPlaced, 2000);
      return () => clearInterval(interval);
    }
  }, [readIds]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const handleNotificationClick = (item) => {
    const role = localStorage.getItem('userRole');
    if (role === 'Admin') {
      // Mark as read and persist in localStorage
      setReadIds(prev => {
        const updated = [...prev, item._id || item.id];
        localStorage.setItem('adminReadNotificationIds', JSON.stringify(updated));
        return updated;
      });
      setCount(prev => prev - 1);
      window.location.href = '/complaint-management';
    } else {
      window.location.href = '/order';
    }
  };
  const iconBackColorOpen = 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={count} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notification"
                  elevation={0}
                  border={false}
                  content={false}
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length === 0 && (
                      <ListItemButton>
                        <ListItemText primary={<Typography variant="body2">No notifications</Typography>} />
                      </ListItemButton>
                    )}
                    {localStorage.getItem('userRole') === 'Admin'
                      ? notifications.filter(c => !readIds.includes(c._id || c.id)).map(complaint => (
                          <ListItemButton key={complaint._id || complaint.id} onClick={() => handleNotificationClick(complaint)}>
                            <ListItemAvatar>
                              <Avatar sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
                                <MessageOutlined />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">Complaint received for Order {complaint.orderId}</Typography>}
                              secondary={`Canteen: ${complaint.canteenName} | ${complaint.complaintType}`}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : '-'}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        ))
                      : notifications.map(order => (
                          <ListItemButton key={order._id} onClick={() => handleNotificationClick(order)}>
                            <ListItemAvatar>
                              <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                                <MessageOutlined />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">Order received from {order.orderId}</Typography>}
                              secondary={new Date(order.orderedDate).toLocaleDateString()}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {new Date(order.orderedDate).toLocaleTimeString()}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        ))}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
