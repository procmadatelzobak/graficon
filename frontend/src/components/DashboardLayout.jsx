import React from 'react';
import Header from './Header';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand selection:text-white overflow-hidden">
            <Header />
            <main className="pt-24 px-8 pb-8 h-screen box-border">
                <div className="grid grid-cols-12 gap-6 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
