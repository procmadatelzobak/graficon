import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from './components/DashboardLayout';
import ZoneRenderer from './components/ZoneRenderer';

function App() {
  const [data, setData] = useState({
    top: { type: 'markdown', content: '' },
    left: { type: 'markdown', content: '' },
    center: { type: 'markdown', content: '' },
    right: { type: 'markdown', content: '' }
  });
  const [notification, setNotification] = useState(null);
  const [seenNotifications, setSeenNotifications] = useState(new Set());
  const [error, setError] = useState(null);
  const isFirstLoad = useRef(true);

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
          // Initial Load: Mark all as seen, don't show overlay
          if (isFirstLoad.current) {
            const allIds = notifications.map(n => n.timestamp);
            setSeenNotifications(new Set(allIds));
            isFirstLoad.current = false;
          } else {
            // Live Update: Check for new notifications
            const lastNotification = notifications[notifications.length - 1];
            const notificationId = lastNotification.timestamp;

            if (!seenNotifications.has(notificationId)) {
              setNotification(lastNotification);
              setSeenNotifications(prev => new Set(prev).add(notificationId));
            }
          }
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

      {/* Top Bar (12 cols) */}
      <div className="col-span-12 min-h-[8rem]">
        <ZoneRenderer title="Top" content={data.top?.content} className="h-full flex flex-col justify-start pt-6" />
      </div>

      {/* Left Column - Info (3 cols) */}
      <div className="col-span-3 flex flex-col gap-6">
        <ZoneRenderer title="Info" content={data.left?.content} className="h-full flex flex-col justify-start pt-6" />
      </div>

      {/* Center Column - Hero (6 cols) */}
      <div className="col-span-6 flex flex-col gap-6">
        <ZoneRenderer title="Hero" content={data.center?.content} className="h-full bg-white/10 flex flex-col justify-start pt-6" />
      </div>

      {/* Right Column - Feed (3 cols) */}
      <div className="col-span-3 flex flex-col gap-6">
        <ZoneRenderer title="Aktuality" content={data.right?.content} className="h-full flex flex-col justify-start pt-6" />
      </div>
    </DashboardLayout>
  );
}

export default App;
