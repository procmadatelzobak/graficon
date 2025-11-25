import React, { useState, useEffect } from 'react';

const Header = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = time.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    const formattedTime = time.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 h-20">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-heading font-bold text-white tracking-wider">MY DVA</span>
                    <div className="w-2 h-2 rounded-full bg-brand"></div>
                    <span className="text-sm font-light text-slate-400 uppercase tracking-widest">Graficon</span>
                </div>
            </div>

            {/* Status / Info */}
            <div className="flex items-center gap-8">
                <div className="text-right">
                    <div className="text-3xl font-heading font-bold text-white leading-none">{formattedTime}</div>
                    <div className="text-sm text-slate-400 capitalize">{formattedDate}</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Online</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
