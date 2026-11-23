"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/citizen/Dashboardlayout";

const reports = [
  {
    id: "CP-2026-001",
    title: "Damaged Road near Main Street",
    category: "Road Damage",
    location: "Dhanmondi, Dhaka",
    date: "Nov 20, 2026",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "CP-2026-002",
    title: "Broken Streetlight",
    category: "Streetlight",
    location: "Mirpur 10, Dhaka",
    date: "Nov 18, 2026",
    status: "Under Review",
    priority: "Medium",
  },
  {
    id: "CP-2026-003",
    title: "Water Drainage Problem",
    category: "Drainage",
    location: "Uttara, Dhaka",
    date: "Nov 15, 2026",
    status: "Resolved",
    priority: "High",
  },
  {
    id: "CP-2026-004",
    title: "Garbage Collection Issue",
    category: "Waste Management",
    location: "Mohammadpur, Dhaka",
    date: "Nov 12, 2026",
    status: "Submitted",
    priority: "Low",
  },
];


export default function CitizenDashboard() {
    
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.id.toLowerCase().includes(search.toLowerCase()) ||
      report.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || report.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
      <div className="flex bg-[#F5FAF9] text-slate-800">
        <DashboardLayout />
      
    </div>
  );
}
