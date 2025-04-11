import React, { useEffect, useState } from "react";
import { Link, usePage, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { getUserColumns } from "./columns";
import Swal from "sweetalert2";
import { router } from "@inertiajs/react";


type Role = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  roles: Role[];
};

type PageProps = {
  users: User[];
  roles: Role[];
  flash?: { success?: string; error?: string };
  auth: { user: { id: number } };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Users", href: "/users" },
];

export default function UsersIndex() {
  const { props } = usePage<PageProps>();
  const { users, roles, flash, auth } = props;
  const [activeRole, setActiveRole] = useState<string>("all");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [changeRole, setChangeRole] = useState<string>("");

  const filteredUsers =
    activeRole === "all"
      ? users
      : users.filter((u) => u.roles.some((r) => r.name === activeRole));

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: flash.success,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    if (flash?.error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: flash.error,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    }
  }, [flash?.success, flash?.error]);

  // Handler for bulk actions
  const handleBulkApply = async () => {
    if (bulkAction === "Delete") {
      if (selectedUserIds.length === 0) return;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will delete all selected users.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
      });
      if (result.isConfirmed) {
        // Send bulk delete request (implement endpoint as needed)
        // Example: router.post('/users/bulk-delete', { ids: selectedUserIds })
        // For now, just delete one by one
        for (const id of selectedUserIds) {
          await router.delete(route("users.destroy", id), { preserveScroll: true });
        }
        setSelectedUserIds([]);
      }
    } else if (bulkAction === "Change role") {
      setShowChangeRole(true);
    }
  };

  const handleChangeRole = async () => {
    if (!changeRole || selectedUserIds.length === 0) return;
    await router.post(route("users.bulkChangeRole"), {
      ids: selectedUserIds,
      role: changeRole,
    }, { preserveScroll: true });
    setShowChangeRole(false);
    setBulkAction("");
    setChangeRole("");
    setSelectedUserIds([]);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="User Management" />
      <div className="mt-8 mx-6">
        {/* Filter tab */}
        <div className="flex items-center gap-4 mb-4 text-sm font-medium">
          <span
            className={`pb-1 cursor-pointer ${
              activeRole === "all"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600 hover:text-blue-700"
            }`}
            onClick={() => setActiveRole("all")}
          >
            All ({users.length})
          </span>
          {roles.map((role) => (
            <span
              key={role.id}
              className={`pb-1 cursor-pointer ${
                activeRole === role.name
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-blue-700"
              }`}
              onClick={() => setActiveRole(role.name)}
            >
              {role.name} ({users.filter((u) => u.roles.some((r) => r.name === role.name)).length})
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Link
            href={route("users.create")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add User
          </Link>
        </div>
        {/* DataTable */}
        <DataTable
          columns={getUserColumns(auth.user.id)}
          data={filteredUsers}
          searchKey="name"
          placeholder="Search users..."
          onSelectedUserIdsChange={setSelectedUserIds}
        />
        {/* Bulk actions */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mt-4 w-full max-w-full">
          <select
            className="border rounded px-3 py-2 w-full sm:w-auto"
            value={bulkAction}
            onChange={(e) => {
              setBulkAction(e.target.value);
              setShowChangeRole(e.target.value === "Change role");
            }}
          >
            <option value="">Bulk actions</option>
            <option value="Delete">Delete</option>
            <option value="Change role">Change role</option>
          </select>
          <button
            className="px-4 py-2 bg-gray-100 border rounded text-gray-700 hover:bg-gray-200 w-full sm:w-auto"
            onClick={handleBulkApply}
          >
            Apply
          </button>
          {showChangeRole && (
            <>
              <select
                className="border rounded px-3 py-2 w-full sm:w-auto"
                value={changeRole}
                onChange={(e) => setChangeRole(e.target.value)}
              >
                <option value="">Change role to...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <button
                className="px-4 py-2 bg-gray-100 border rounded text-gray-700 hover:bg-gray-200 w-full sm:w-auto"
                onClick={handleChangeRole}
              >
                Change
              </button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
