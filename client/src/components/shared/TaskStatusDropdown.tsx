"use client";

import { Dropdown, Label } from "@heroui/react";
import { ChevronDown } from "lucide-react";

export type TaskStatusFilter =
  | "All"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed";

interface TaskStatusDropdownProps {
  value: TaskStatusFilter;
  onChange: (status: TaskStatusFilter) => void;
}

const statuses: TaskStatusFilter[] = [
  "All",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

export default function TaskStatusDropdown({
  value,
  onChange,
}: TaskStatusDropdownProps) {
  return (
    <Dropdown>
      <Dropdown.Trigger
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 outline-none hover:border-[#0F766E] focus-visible:ring-2 focus-visible:ring-teal-100"
        aria-label="Filter tasks by status"
      >
        <span>{value === "All" ? "All statuses" : value}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Filter tasks by status">
          {statuses.map((status) => (
            <Dropdown.Item
              key={status}
              id={status}
              textValue={status === "All" ? "All statuses" : status}
              onClick={() => onChange(status)}
            >
              <Label>{status === "All" ? "All statuses" : status}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
