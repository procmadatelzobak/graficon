import React from 'react';

const useVariableReplacer = (content) => {
    const [processedContent, setProcessedContent] = React.useState(content);

    React.useEffect(() => {
        const update = () => {
            if (!content) {
                setProcessedContent(content);
                return;
            }
            const now = new Date();
            const time = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
            const day = now.toLocaleDateString('cs-CZ', { weekday: 'long' });
            const dayCap = day.charAt(0).toUpperCase() + day.slice(1);

            let newContent = content
                .replace(/\$time/g, time)
                .replace(/\$date/g, date)
                .replace(/\$day/g, dayCap);

            setProcessedContent(newContent);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [content]);

    return processedContent;
};

const ZoneRenderer = ({ content, title, className }) => {
    const processedContent = useVariableReplacer(content);

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
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
        </div>
    );
};

export default ZoneRenderer;
