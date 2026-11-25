import Sidebar from '@/components/dashboard/Sidebar';
import ProtectedDashboard from '@/components/auth/ProtectedDashboard';
import React from 'react';

const DepartmentManagerDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedDashboard role="department_manager">
            <div className="min-h-screen w-full min-w-0">
                <Sidebar role="department-manager" mode="mobile" />
                <div className="flex min-w-0 flex-1 flex-col lg:min-h-screen lg:flex-row">
                    <Sidebar role="department-manager" mode="desktop" />
                    <main className="w-full min-w-0 flex-1 pb-4">{children}</main>
                </div>
            </div>
        </ProtectedDashboard>
    );
};

export default DepartmentManagerDashboardLayout;