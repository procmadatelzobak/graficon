import React, { useEffect, useState } from 'react';

const Overlay = ({ message, style, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 500); // Wait for fade out animation
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message && !visible) return null;

    const getStyleClasses = () => {
        switch (style) {
            case 'success': return 'bg-green-500/90';
            case 'warning': return 'bg-yellow-500/90';
            case 'error': return 'bg-red-500/90';
            default: return 'bg-brand/90';
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className={`absolute inset-0 backdrop-blur-sm ${getStyleClasses()}`} />
            <div className="relative z-10 max-w-4xl p-12 text-center text-white">
                <h1 className="text-6xl font-heading font-bold mb-8 animate-bounce">
                    {message}
                </h1>
            </div>
        </div>
    );
};

export default Overlay;
