import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import ZoneRenderer from './components/ZoneRenderer';

function App() {
  const [data, setData] = useState({
    left: { type: 'markdown', content: '' },
    center: { type: 'markdown', content: '' },
    right: { type: 'markdown', content: '' }
  });
  const [notification, setNotification] = useState(null);
  const [seenNotifications, setSeenNotifications] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch State
        const stateRes = await fetch('/api/state?t=' + Date.now());
        if (!stateRes.ok) throw new Error('Failed to fetch state');
        const stateData = await stateRes.json();
        setData(stateData);

        // Fetch Notifications
        const notifyRes = await fetch('/api/notifications?t=' + Date.now());
        if (!notifyRes.ok) throw new Error('Failed to fetch notifications');
        const notifications = await notifyRes.json();

        // Check for new notifications
        if (notifications.length > 0) {
          const lastNotification = notifications[notifications.length - 1];
          const notificationId = lastNotification.timestamp; // Use timestamp as ID



          // Only show notifications younger than 30 seconds to prevent ghost notifications on page reload
          const NOTIFICATION_MAX_AGE_MS = 30000; // 30 seconds
          const now = Date.now();
          const notifTime = new Date(lastNotification.timestamp).getTime();
          const isRecent = !isNaN(notifTime) && (now - notifTime) < NOTIFICATION_MAX_AGE_MS;


          if (isRecent && !seenNotifications.has(notificationId)) {
            setNotification(lastNotification);
          }
          // Always mark as seen to prevent future re-trigger
          setSeenNotifications(prev => new Set(prev).add(notificationId));
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [seenNotifications]);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  return (
    <DashboardLayout notification={notification} onNotificationClose={handleNotificationClose}>
      {error && (
        <div className="fixed top-24 right-8 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Connection Error
        </div>
      )}

      {/* Left Column - Info (3 cols) */}
      <div className="col-span-3 flex flex-col gap-6">
        <ZoneRenderer title="Info" content={data.left?.content} className="h-full flex flex-col justify-center" />
      </div>

      {/* Center Column - Hero (6 cols) */}
      <div className="col-span-6 flex flex-col gap-6">
        <ZoneRenderer title="Hero" content={data.center?.content} className="h-full bg-white/10 flex flex-col justify-center" />
      </div>

      {/* Right Column - Feed (3 cols) */}
      <div className="col-span-3 flex flex-col gap-6">
        <ZoneRenderer title="Aktuality" content={data.right?.content} className="h-full flex flex-col justify-center" />
      </div>
    </DashboardLayout>
  );
}

export default App;
