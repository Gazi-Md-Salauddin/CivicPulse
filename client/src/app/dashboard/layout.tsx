import React from 'react'
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full min-w-0">
      {children}
    </div>
  )
}

export default DashboardLayout