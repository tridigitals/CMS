import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { PageProps, BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { getPermissionColumns, Permission } from "./columns";

interface Props extends PageProps {
  permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Permissions", href: "/permissions" },
];

const PermissionsIndex: React.FC<Props> = ({ permissions }) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permission Management" />
      <div className="mt-8 mx-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Permission Management</h1>
          <Link href="/permissions/create">
            <Button>Add Permission</Button>
          </Link>
        </div>
        <DataTable
          columns={getPermissionColumns()}
          data={permissions}
          searchKey="name"
          placeholder="Search permissions..."
        />
      </div>
    </AppLayout>
  );
};

export default PermissionsIndex;
