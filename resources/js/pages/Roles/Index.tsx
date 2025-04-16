import React, { useEffect } from "react";
import { Link, Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, PageProps as BasePageProps } from "@/types";
import Swal from "sweetalert2";
import { DataTable } from "@/components/ui/data-table";
import { getRoleColumns, Role } from "./columns";

interface Props extends BasePageProps {
  roles: Role[];
  flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Roles", href: "/roles" },
];

const RolesIndex: React.FC<Props> = (props) => {
  const { roles, flash } = props;

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Role Management" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Role Management</h1>
          <Link
            href="/roles/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Role
          </Link>
        </div>
        <DataTable
          columns={getRoleColumns()}
          data={roles}
          searchKey="name"
          placeholder="Search roles..."
        />
      </div>
    </AppLayout>
  );
};

export default RolesIndex;
