import { signOut, useSession } from "@/lib/auth-client";
import { ArrowRightFromSquare, Gear, Persons } from "@gravity-ui/icons";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function ProfieDropdown() {

  const { data: session, isPending } = useSession();

  const user = session?.user

  const router = useRouter();

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  if (!user) {
    return null;
  }


  const dashboardLinks = {
    citizen: '/dashboard/citizen',
    department_manager: '/dashboard/department-manager',
    maintenance_staff: '/dashboard/maintenance-staff',
    admin: '/dashboard/admin'
  }

  const handleDashboard = () => {

  const role = user?.role;

  if (role && Object.prototype.hasOwnProperty.call(dashboardLinks, role)) {
    router.push(dashboardLinks[role as keyof typeof dashboardLinks]);
  } else {
    console.error("Invalid or unsupported role:", role);
  }
};


  return (
    <Dropdown>
      <Dropdown.Trigger className="rounded-full">
        <Avatar>
          <Avatar.Image
            alt={user.name}
            src={user.image ?? undefined}
          />
          <Avatar.Fallback delayMs={600}>{user.name.charAt(0)}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <Avatar.Image
                alt={user.name}
                src={user.image ?? undefined}
              />
              <Avatar.Fallback delayMs={600}>{user.name.charAt(0)}</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col gap-0">
              <p className="text-sm leading-5 font-medium">{user.name}</p>
              <p className="text-xs leading-none text-muted">{user.email}</p>
            </div>
          </div>
        </div>
        <Dropdown.Menu>
          <Dropdown.Item id="dashboard" textValue="Dashboard" onClick={handleDashboard}>
            <Label>Dashboard</Label>
          </Dropdown.Item>

          <Dropdown.Item id="logout" textValue="Logout" variant="danger" onClick={handleSignOut}>
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Log Out</Label>
              <ArrowRightFromSquare className="size-3.5 text-danger" />
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}