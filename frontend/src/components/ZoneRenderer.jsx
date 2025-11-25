import React from 'react';

const ZoneRenderer = ({ content, title, className }) => {
    if (!content) {
        return (
            <div className={`flex flex-col items-center justify-center h-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${className}`}>
                {title && <h3 className="mb-2 text-lg font-heading text-slate-400">{title}</h3>}
                <p className="text-slate-500 italic">Žádná data k zobrazení</p>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 ${className}`}>
            {title && (
                <div className="mb-4 pb-2 border-b border-white/10">
                    <h3 className="text-xl font-heading font-semibold text-brand">{title}</h3>
                </div>
            )}
            <div
                className="prose prose-invert prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default ZoneRenderer;
