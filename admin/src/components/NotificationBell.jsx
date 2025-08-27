import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ ownerId }) => {
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  // Poll notifications every 10 seconds
  useEffect(() => {
    const fetchNotifications = () => {
      axios.get('/api/notifications')
        .then(res => {
          const notifs = Array.isArray(res.data) ? res.data : [];
          setNotifications(notifs);
          setCount(notifs.filter(n => !n.isRead).length);
        });
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (orderId, notifId) => {
    // Mark as read in backend
    await axios.patch(`/api/notifications/${notifId}/read`);
    setNotifications(prev =>
      prev.map(n => n._id === notifId ? { ...n, isRead: true } : n)
    );
    setCount(prev => prev - 1);
    navigate('/order');
  };

  return (
    <div>
      <button>
        Notifications <span>{count}</span>
      </button>
      <ul>
        {Array.isArray(notifications) && notifications.map(n => (
          <li key={n._id} style={{ fontWeight: n.isRead ? 'normal' : 'bold', cursor: 'pointer' }}
              onClick={() => handleNotificationClick(n.orderId, n._id)}>
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationBell;