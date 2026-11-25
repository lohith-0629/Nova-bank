import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../navigation/Header';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { Sidebar } from '../navigation/Sidebar';

export const AppLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onOpenMobileMenu={() => setMobileDrawerOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-10">
          <div className="mx-auto max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNavigation
        drawerOpen={mobileDrawerOpen}
        onOpenDrawer={() => setMobileDrawerOpen(true)}
        onCloseDrawer={() => setMobileDrawerOpen(false)}
      />
    </div>
  );
};
