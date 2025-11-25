import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import ZoneRenderer from './components/ZoneRenderer';

function App() {
  const [data, setData] = useState({
    left: '<h2>Vítejte</h2><p>Toto je informační panel.</p>',
    center: '<h1>Hlavní zpráva dne</h1><p>Graficon běží na plný výkon.</p>',
    right: '<ul><li>Novinka 1</li><li>Novinka 2</li></ul>'
  });

  return (
    <DashboardLayout>
      {/* Left Column - Info (3 cols) */}
      <div className="col-span-3 flex flex-col gap-6">
        <ZoneRenderer title="Info" content={data.left} className="h-full" />
      </div>

      {/* Center Column - Hero (6 cols) */}
      <div className="col-span-6 flex flex-col gap-6">
        <ZoneRenderer title="Hero" content={data.center} className="h-full bg-white/10" />
      </div>

      {/* Right Column - Feed (3 cols) */}
      <div className="col-span-3 flex flex-col gap-6">
        <ZoneRenderer title="Aktuality" content={data.right} className="h-full" />
      </div>
    </DashboardLayout>
  );
}

export default App;
