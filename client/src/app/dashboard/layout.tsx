import React from 'react'
import Sidebar from '@/components/dashboard/Sidebar'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row space-y-2 lg:space-y-0">
      <div className="flex-1 pb-4">{children}</div>
    </div>
  )
}

export default DashboardLayout