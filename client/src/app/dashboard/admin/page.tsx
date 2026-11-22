import Sidebar from '@/components/dashboard/Sidebar';
import React from 'react';

const AdminDashboardpage = () => {
    return (
        <div className="flex bg-[#F5FAF9] text-slate-800">
        
                <Sidebar
                  role="citizen"
                  mode="desktop"
                />
            </div>
    );
};

export default AdminDashboardpage;