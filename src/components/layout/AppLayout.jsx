import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './AppLayout.css';

export default function AppLayout({ children, activeNav = 'drivers' }) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="app-shell">
      <Topbar searchValue={searchValue} onSearch={setSearchValue} />
      <div className="app-body">
        <Sidebar active={activeNav} />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
