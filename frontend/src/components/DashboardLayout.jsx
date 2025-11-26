import React from 'react';
import Header from './Header';
import Overlay from './Overlay';

const DashboardLayout = ({ children, notification, onNotificationClose }) => {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand selection:text-white overflow-hidden">
            <Header />
            <Overlay
                message={notification?.message}
                style={notification?.style}
                onClose={onNotificationClose}
            />
            <main className="pt-24 px-8 pb-8 h-screen box-border">
                <div className="grid grid-cols-12 grid-rows-[auto_1fr] gap-6 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
