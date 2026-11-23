import Sidebar from '@/components/dashboard/Sidebar';
import React from 'react';

const CitizenDashboardLayout = async ({ children }: { children: React.ReactNode }) => {

    return (
        <div className="min-h-screen flex flex-col lg:flex-row space-y-2 lg:space-y-0">
            <Sidebar role="citizen" mode="desktop" />
            <div className="flex-1 pb-4">{children}</div>
        </div>

    );
};

export default CitizenDashboardLayout;