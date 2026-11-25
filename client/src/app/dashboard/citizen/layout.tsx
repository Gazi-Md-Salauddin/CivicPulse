import Sidebar from '@/components/dashboard/Sidebar';
import ProtectedDashboard from '@/components/auth/ProtectedDashboard';
import React from 'react';

const CitizenDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedDashboard role="citizen">
            <div className="min-h-screen flex flex-col lg:flex-row space-y-2 lg:space-y-0">
                <Sidebar role="citizen" mode="desktop" />
                <div className="flex-1 pb-4">{children}</div>
            </div>
        </ProtectedDashboard>
    );
};

export default CitizenDashboardLayout;