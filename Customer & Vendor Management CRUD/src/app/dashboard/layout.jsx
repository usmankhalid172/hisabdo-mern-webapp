'use client';

import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout-wrapper">
      <Sidebar />
      <main className="dashboard-main-content">
        {children}
      </main>
    </div>
  );
}
